from cdp.smart_contract import SmartContract

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


CONTRACT_ADDRESS = "0x393260169373865447c334426B32F94470b22aA6"
NETWORK_ID = "base-sepolia"

# contract = SmartContract.register(CONTRACT_ADDRESS,NETWORK_ID,abi)
print(SmartContract.read(
    NETWORK_ID,
    CONTRACT_ADDRESS,
    "owner",
    abi,
))