import json
from typing_extensions import TypedDict, List, Dict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from github.agent import initialize_github_agent
from rate_issue.agent import initialize_rating_agent
from agent import initialize_meta_agent

class State(TypedDict):
    # User input
    owner: str
    repo: str
    total_budget: int
    action: str
    
    # Issue that is being evaluated
    current_issue: int
    
    # Evaluation results for the issue
    action_items: str
    
    # List of dictionaries mapping issue numbers to difficulty ratings
    issues: List[Dict[int, int]]

memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

github_agent,_ = initialize_github_agent(memory, config)
def evaluate_issue(state: State):
    print("evaluating:",state['current_issue'])
    action_items = github_agent.invoke(
        {"messages": [f"Owner:{state['owner']}, Repo:{state['repo']}, Issue:{state['current_issue']}"]},
    )
    return {"action_items": action_items["messages"][-1].content}

rating_agent,_ = initialize_rating_agent(memory, config)
def assign_rating(state: State):
    print("rating:",state['current_issue'])
    rating = rating_agent.invoke(
        {"messages": [f"{state['action_items']}"]},
    )
    issues = state.get("issues", {}) 
    issues[state["current_issue"]] = rating["messages"][-1].content
    for issue, rating in issues.items():
            if rating == 0:
                current_issue = issue
                return {"issues": issues, "current_issue": current_issue, "action": "evaluate"}
    return {"issues": issues,"action_items":"","current_issue":0, "action":""}

meta_agent,_ = initialize_meta_agent(memory, config)
def meta_agent_routing(state: State):
    if state["action"] == "fetch":
        response =  meta_agent.invoke(
            {"messages": [f"Owner:{state['owner']}, Repo:{state['repo']}"]},
        )
        json_response = json.loads(response["messages"][-1].content)
        action=json_response["ACTION"]
        result=json_response["RESULT"]
        
        if action == "FETCH":
            issues = {issue: 0 for issue in result}
            current_issue = 0
            for issue, rating in issues.items():
                if rating == 0:
                    current_issue = issue
                    return {"issues": issues, "current_issue": current_issue, "action": "evaluate"}
        return {"issues":issues, "action":""}
    # elif state["action"] == "evaluate":
    #     response =  meta_agent.invoke(
    #         {"messages": [f"Owner:{state['owner']}, Repo:{state['repo']}, Issue:{state['current_issue']}"]},
    #     )
    #     print(response["messages"][-1].content)
    #     return {"issues":[]}
    # elif state["action"] == "send":
    #     response =  meta_agent.invoke(
    #         {"messages": [f"{state['action_items']}"]},
    #     )
    #     print(response["messages"][-1].content)
    #     return {"issues":[]}
    
def next_step(state: State):
    if state["action"] == "fetch":
        return "meta_agent_routing"
    elif state["action"] == "evaluate":
        return "evaluate_issue"
    elif state["action"] == "rate":
        return "rate_issue"
    elif state["action"] == "send":
        return "assign_rating"
    elif state["action"] == "":
        return END

workflow = StateGraph(State)

workflow.add_node(meta_agent_routing)
workflow.add_node(evaluate_issue)
workflow.add_node(assign_rating)

workflow.add_edge(START, "meta_agent_routing")
workflow.add_conditional_edges("meta_agent_routing", next_step, ["evaluate_issue", END])
workflow.add_edge("evaluate_issue", "assign_rating")
workflow.add_conditional_edges("assign_rating", next_step, ["evaluate_issue", END])

chain = workflow.compile()
state = chain.invoke({"owner": "grafana", "repo": "grafana-app-sdk", "total_budget": 1000, "action": "fetch"},{"recursion_limit": 100})
print("Final state:", state)