import os
import json
from web3 import Web3

base_sepolia_url="https://sepolia.base.org"
web3 = Web3(Web3.HTTPProvider(base_sepolia_url))

abi_file_path = "../contracts/abi.json"

abi=None
if os.path.exists(abi_file_path):
    with open(abi_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        abi=data["abi"]

contract_address_file_path="contract_address.txt"
contract_address = None

if os.path.exists(contract_address_file_path):
        with open(contract_address_file_path) as f:
            contract_address = f.read()

contract = web3.eth.contract(address=contract_address, abi=abi)

def get_contributor_address(username: str) -> str:
    return contract.functions.userWallets(username).call()

def check_repo_registration(repoID: str) -> bool:
    repo_data=contract.functions.repoStates(repoID).call()
    if len(repo_data[0])>0:
        return True
    return False

def get_repo_state(repoID: str):
    repo_data = contract.functions.repoStates(repoID).call()
    issues= contract.functions.getRepoIssues(repoID).call()
    
    state = {
        "owner": repo_data[0],
        "repoName": repo_data[1],
        "remaining_budget": repo_data[2],
        "issues": issues,
        "total_rating": repo_data[3]
    }
    
    return state

if __name__ == "__main__":
    print(contract.functions.owner().call())
    print(get_contributor_address("0xbala-k"))
    print(get_repo_state("grafana/grafana-app-sdk"))
