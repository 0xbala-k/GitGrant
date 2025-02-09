import json
from typing_extensions import TypedDict, List, Dict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from github.agent import initialize_github_agent
from rate_issue.agent import initialize_rating_agent
from agent import initialize_meta_agent
from github.contribution import get_contribution
from interactions.deploy import register_user, register_repo, update_issues, resolve_issue
from interactions.read import get_repo_state, check_repo_registration
class State(TypedDict):
    # User input
    username: str
    address: str
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
    issues[state["current_issue"]] = int(rating["messages"][-1].content)
    sum=0
    for issue, rating_val in issues.items():
        sum+=int(rating_val)
        if rating_val == 0:
            current_issue = issue
            return {"issues": issues, "current_issue": current_issue, "action": "evaluate"}
    issueNumbers=[str(num) for num in list(issues.keys())]
    ratings=[str(num) for num in list(issues.values())]
    update_issues(state["owner"]+"/"+state["repo"],issueNumbers,ratings,str(int(sum)))
    return {"issues": issues,"action_items":"","current_issue":0, "action":"", "rating_sum":sum,"message":f"Total {len(issueNumbers)} issues are fetched and rated."}

meta_agent,_ = initialize_meta_agent(memory, config)
def meta_agent_routing(state: State):
    if state["action"] == "register user":
        register_user(state["username"],state["address"])
        return {"action":"","message":f"User {state["username"]} registered with address {state["address"]}."}
    elif state["action"] == "register repo":
        if check_repo_registration(state["owner"]+"/"+state["repo"]):
            return {"action":"","message":f"Repo {state["owner"]+"/"+state["repo"]} already registered."}
        
        register_repo(state["owner"],state["repo"])
        return {"action":"", "message":f"Repo {state["owner"]+"/"+state["repo"]} successfully registered."}
    elif state["action"] == "fetch":
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
        
        # update repo state in smart contract
        issueNumbers=[str(num) for num in list(issues.keys())]
        ratings=[str(num) for num in list(issues.values())]
        update_issues(state["owner"]+"/"+state["repo"],issueNumbers,ratings,str(int(state["rating_sum"])))
        return {"issues":issues, "action":"","message":f"Total {len(issueNumbers)} issues are fetched and rated."}
        
    elif state["action"] == "resolve":
        contribution = get_contribution(owner=state["owner"], repo=state["repo"], pr=state["current_issue"])
        if contribution["linked issue"]==0:
            return {"message": f"PR {state['current_issue']} is not linked to any issue.", "action":""}
        elif contribution["pr_state"]=="open":
            return {"message": f"PR {state['current_issue']} is still open.", "action":""}
        elif contribution["issue_state"]=="open":
            return {"message": f"Linked issue {contribution['linked issue']} is still open.", "action":""}
        
        # mark issue resolved and pay contributor through smart contract
        amount=calculate_reward_amount(state["owner"]+"/"+state["repo"],contribution["linked issue"])
        
        if amount is None:
            return {"message": f"Linked issue {contribution['linked issue']} is has no reward assigned.", "action":""}
    
        resolve_issue(state["owner"]+"/"+state["repo"],str(contribution["linked issue"]),contribution["author"],str(amount))
        
        return {"action":"", "message":f"Issue #{contribution["linked issue"]} resolved and {amount} paid to {contribution["author"]}."}
    
def next_step(state: State):
    if state["action"] == "fetch":
        return "meta_agent_routing"
    elif state["action"] == "evaluate":
        return "evaluate_issue"
    elif state["action"] == "":
        return END


def init_chain():
    workflow = StateGraph(State)

    workflow.add_node(meta_agent_routing)
    workflow.add_node(evaluate_issue)
    workflow.add_node(assign_rating)

    workflow.add_edge(START, "meta_agent_routing")
    workflow.add_conditional_edges("meta_agent_routing", next_step, ["evaluate_issue", END])
    workflow.add_edge("evaluate_issue", "assign_rating")
    workflow.add_conditional_edges("assign_rating", next_step, ["evaluate_issue", END])

    chain = workflow.compile()
    return chain

def calculate_reward_amount(repoID: str, issueNumber: int):
    repo_state=get_repo_state(repoID)
    issues=repo_state["issues"]
    remaining_budget=repo_state["remaining_budget"]
    total_rating=repo_state["total_rating"]
    rating=None
    for issue in issues:
        if issue[0] == int(issueNumber):
            rating=issue[1]
            break

    if rating is None:
        return None
    reward=int((remaining_budget/total_rating)*rating)
    return reward

if __name__ == '__main__':
    
    chain = init_chain()
    
    print("Registering user....")
    state={"username":"0xbala-k", "address":"0xD0A6F0F54803E50F27A6CC1741031094267AEE78", "action":"register user"}
    state = chain.invoke(state)
    print("Final state:", state)
    
    print("Registering repo....")
    state={"owner": "grafana", "repo": "grafana-app-sdk", "action": "register repo"}
    state = chain.invoke(state)
    print("Final state:", state)
    
    print("Fetching issues....")
    state={"owner": "grafana", "repo": "grafana-app-sdk", "action": "fetch"}
    state = chain.invoke(state,{"recursion_limit": 100})
    print("Final state:", state)
    
    # print("Resolving issue....")
    # state={"owner": "grafana", "repo": "grafana-app-sdk", "current_issue":568, "action": "resolve"}
    # state = chain.invoke(state)
    # print("Final state:", state)