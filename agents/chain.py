from typing_extensions import TypedDict, List, Dict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from github.agent import initialize_github_agent
from rate_issue.agent import initialize_rating_agent

class State(TypedDict):
    # User input
    owner: str
    repo: str
    total_budget: int
    
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
    action_items = github_agent.invoke(
        {"messages": [f"Owner:{state['owner']}, Repo:{state['repo']}, Issue:{state['current_issue']}"]},
    )
    return {"action_items": action_items["messages"][-1].content}

rating_agent,_ = initialize_rating_agent(memory, config)
def assign_rating(state: State):
    rating = rating_agent.invoke(
        {"messages": [f"{state['action_items']}"]},
    )
    issues = state.get("issues", {}) 
    issues[state["current_issue"]] = rating["messages"][-1].content
    return {"issues": issues,"action_items":"","current_issue":0}

workflow = StateGraph(State)

workflow.add_node(evaluate_issue)
workflow.add_node(assign_rating)

workflow.add_edge(START, "evaluate_issue")
workflow.add_edge("evaluate_issue", "assign_rating")
workflow.add_edge("assign_rating", END)

chain = workflow.compile()
state = chain.invoke({"owner": "grafana", "repo": "grafana-app-sdk", "total_budget": 1000, "current_issue": 559})
state['current_issue'] = 523
state = chain.invoke(state)
state['current_issue'] = 312
state = chain.invoke(state)
print("Final state:", state)