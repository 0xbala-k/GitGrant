import json
from typing_extensions import TypedDict, List, Dict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from github.agent import initialize_github_agent
from rate_issue.agent import initialize_rating_agent
from agent import initialize_meta_agent
from github.contribution import get_contribution

class State(TypedDict):
    # User input
    owner: str
    repo: str
    remaining_budget: int
    action: str
    
    # Issue that is being evaluated
    current_issue: int
    
    # Evaluation results for the issue
    action_items: str
    
    # List of dictionaries mapping issue numbers to difficulty ratings
    issues: List[Dict[int, int]]
    
    # Sum of all difficulty ratings  
    rating_sum: int
    
    # Final message to be sent to the user or agent
    message: str

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
    issues[state["current_issue"]] = int(rating["messages"][-1].content)
    sum=0
    for issue, rating_val in issues.items():
        sum+=int(rating_val)
        if rating_val == 0:
            current_issue = issue
            return {"issues": issues, "current_issue": current_issue, "action": "evaluate"}
    return {"issues": issues,"action_items":"","current_issue":0, "action":"", "rating_sum":sum}

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
        else: 
            print("Invalid action")
        return {"issues":issues, "action":""}
        
    elif state["action"] == "send":
        contribution = get_contribution(owner=state["owner"], repo=state["repo"], pr=state["current_issue"])
        if contribution["linked issue"]==0:
            return {"message": f"PR {state['current_issue']} is not linked to any issue.", "action":"", "current_issue":0}
        elif contribution["pr_state"]=="open":
            return {"message": f"PR {state['current_issue']} is still open.", "action":"", "current_issue":0}
        elif contribution["issue_state"]=="open":
            return {"message": f"Linked issue {contribution['linked issue']} is still open.", "action":"", "current_issue":0}
        
        # get contribution["author"] address
        address="0xD0A6F0F54803E50F27A6CC1741031094267AEE78"
        response =  meta_agent.invoke(
            {"messages": [f"Address: {address}, Amount: {(state['remaining_budget']/state['rating_sum'])*state['issues'][int(contribution['linked issue'])]}"]},
        )
        print(response["messages"][-1].content)
        return {"issues":[], "current_issue":0, "action":""}
    
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
state={"owner": "grafana", "repo": "grafana-app-sdk", "remaining_budget": 0.0001, "action": "fetch"}

state = chain.invoke(state,{"recursion_limit": 100})
print("Final state:", state)
# state={
#     'owner': 'grafana', 
#     'repo': 'grafana-app-sdk', 
#     'remaining_budget': 0.1, 
#     'action': '', 
#     'current_issue': 0, 
#     'action_items': '', 
#     'issues': {617: 85, 559: 85, 523: 85, 522: 85, 489: 82, 460: 75, 457: 85, 455: 85, 453: 85, 375: 85, 363: 65, 353: 75, 312: 65, 292: 75, 236: 85, 201: 85, 194: 85, 193: 75, 191: 85, 187: 75, 184: 85, 163: 85, 151: 85, 88: 70, 72: 75, 48: 75, 47: 75, 39: 85, 26: 75, 19: 75}, 
#     'rating_sum': 2392
#     }
state["action"] = "send"
state["issues"][407]=85
state["current_issue"] = 409
state = chain.invoke(state)