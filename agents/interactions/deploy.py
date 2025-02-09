import os
import json
from dotenv import load_dotenv
from typing_extensions import List, Tuple

from cdp import Wallet
from cdp_langchain.utils import CdpAgentkitWrapper

load_dotenv()


abi_file_path = "../contracts/abi.json"

abi=None
if os.path.exists(abi_file_path):
    with open(abi_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        abi=data["abi"]

class Issue:
    issueNumber: int
    difficultyRating: int

Uint256 = int
Uint256Array = List[List[Uint256]] 
    
def setup_wallet(wallet_data_file):
    wallet_data = None

    if os.path.exists(wallet_data_file):
        with open(wallet_data_file) as f:
            wallet_data = f.read()

    # Configure CDP Agentkit Langchain Extension.
    values = {}
    if wallet_data is not None:
        # If there is a persisted agentic wallet, load it and pass to the CDP Agentkit Wrapper.
        values = {"cdp_wallet_data": wallet_data}
        
    agentkit = CdpAgentkitWrapper(**values)

    agentkit.wallet.save_seed_to_file("seed.txt")

    wallet_data = json.loads(wallet_data)

    wallet=Wallet.fetch(wallet_data["wallet_id"])
    wallet.load_seed_from_file("seed.txt")

    return wallet

wallet = setup_wallet("wallet_data.txt")
contract_address_file = "contract_address.txt"

contract_address=None
if os.path.exists(contract_address_file):
        with open(contract_address_file) as f:
            contract_address = f.read()

def deploy_contract(contract_name, contract_input_file):
    contract = wallet.deploy_contract(
        solidity_version="0.8.26+commit.8a97fa7a",
        solidity_input_json=contract_input_file,
        contract_name=contract_name,
        constructor_args={}
    )
    contract.wait()

def register_user(username: str, address: str):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="registerUser",
    args={"username": username, "wallet": address})
    
    invocation.wait()
    
def register_repo(gitHubOwner: str, repoName: str):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="registerRepo",
    args={"repoName": gitHubOwner+"/"+repoName, "githubOwnerName": gitHubOwner, "githubRepoName": repoName})
    
    invocation.wait()

def update_issues(repoID: str, issueNumbers: List[str], difficultyRatings: List[str], totalRating: str):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="updateIssues",
    args={"repoName": repoID, "issueNumbers": issueNumbers, "difficultyRatings": difficultyRatings, "totalRating": totalRating})
    
    invocation.wait()
    
def resolve_issue(repoID: str, issueNumber: str, githubUsername: str, amount: str):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="resolveIssue",
    args={"repoName": repoID, "issueNumber": issueNumber, "githubUsername": githubUsername, "amount": amount})
    
    invocation.wait()

if __name__ == "__main__":

    register_user("0xbala-k","0xD0A6F0F54803E50F27A6CC1741031094267AEE78")
    register_repo("grafana","grafana-app-sdk")

    update_issues(
        "grafana/grafana-app-sdk",
        ["500","501","502","508","511"],
        ["85","75","55","77","65"], 
        "357"
    )
    
    resolve_issue(
        "grafana/grafana-app-sdk",
        "500",
        "0xbala-k",
        "226666666667"
    )
    
    
    