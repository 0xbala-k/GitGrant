import os
import requests
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI

# Load environment variables from the .env file
load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini")

prompt="""
    Given body of a github PR, return the issue number it closes. If there is no issue that is linked to the PR, return 0.
    Examples for mention of issue number: Resolves [link-to-issue], Fixes [link-to-issue], Closes [link-to-issue]
    Return only the issue number.
"""
        
def get_contribution(owner: str, repo: str, pr: int):
    """
    Retrieve the contributor of a specific issue in a GitHub repository.
    
    Args:
        owner (str): The owner of the repository.
        repo (str): The repository name.
        issue_number (int): The issue number.
    
    Returns:
        dict: A dictionary containing the issue details.
    """
    
    # Define the base URL for fetching pr details
    base_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr}"
    
    # Retrieve the GitHub API token from environment variables
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN not set in environment variables")
    
    # Set the required headers
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    # Make the GET request to fetch issue details
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()  # Raise an error if the request failed
    
    # Parse the JSON response
    pr = response.json()
    pr_author=pr.get('user').get('login')
    pr_state=pr.get('state')
    
    response=llm.invoke(f"{prompt} Body: {pr.get('body')}")
    linked_issue=response.content
    
    if linked_issue==0:
        return {"author":pr_author, "pr_state":pr_state, "linked issue":linked_issue, "issue_state":"N/A"}
    
    # Define the base URL for fetching issue details
    base_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{linked_issue}"
    
    # Set the required headers
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    # Make the GET request to fetch issue details
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()  # Raise an error if the request failed
    
    # Parse the JSON response
    issue = response.json()
    
    issue_state=issue.get('state')
    
    return {"author":pr_author, "pr_state":pr_state, "linked issue":linked_issue, "issue_state":issue_state}
        
