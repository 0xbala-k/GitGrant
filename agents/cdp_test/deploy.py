import os
import json
from dotenv import load_dotenv
from typing_extensions import List, Tuple

from cdp import Wallet
from cdp_langchain.utils import CdpAgentkitWrapper

load_dotenv()

abi = [
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "agent",
						"type": "address"
					}
				],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "repoName",
						"type": "string"
					}
				],
				"name": "depositFunds",
				"outputs": [],
				"stateMutability": "payable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "owner",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "repoName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "githubOwnerName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "githubRepoName",
						"type": "string"
					}
				],
				"name": "registerRepo",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "username",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					}
				],
				"name": "registerUser",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"name": "repoStates",
				"outputs": [
					{
						"internalType": "string",
						"name": "githubOwnerName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "githubOwnerRepo",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "remainingBudget",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "ratingSum",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "repoName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "issueNumber",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "githubUsername",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "resolveIssue",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "repoName",
						"type": "string"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "issueNumber",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "difficultyRating",
								"type": "uint256"
							}
						],
						"internalType": "struct GitGrant.Issue[]",
						"name": "newRatings",
						"type": "tuple[]"
					},
					{
						"internalType": "uint256",
						"name": "totalRating",
						"type": "uint256"
					}
				],
				"name": "updateIssues",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"name": "userWallets",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			}
		]

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

wallet = setup_wallet("../wallet_data.txt")
contract_address_file = "../contract_address.txt"

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

def update_issues(repoID: str, newRatings: List[Tuple[int, int]], totalRating: int):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="updateIssues",
    args={"repoName": repoID, "newRatings": newRatings, "totalRating": totalRating})
    
    invocation.wait()
    
def resolve_issue(repoID: str, issueNumber: int, githubUsername: str, amount: int):
    invocation = wallet.invoke_contract(
    contract_address=contract_address,
    abi=abi,
    method="resolveIssue",
    args={"repoName": repoID, "issueNumber": issueNumber, "githubUsername": githubUsername, "amount": amount})
    
    invocation.wait()

if __name__ == "__main__":

    register_user("0xbala-k","0xD0A6F0F54803E50F27A6CC1741031094267AEE78")
    register_repo("grafana","grafana-app-sdk")
    
    
    