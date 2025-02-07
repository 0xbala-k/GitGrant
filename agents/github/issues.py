import os
import requests
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def get_all_open_issues(owner: str, repo: str, per_page: int = 100) -> list:
    """
    Retrieve all open issues for a given GitHub repository.
    
    This function iteratively fetches open issues using the issues endpoint and pagination.
    
    Args:
        owner (str): Repository owner.
        repo (str): Repository name.
        per_page (int): Number of results per page (max 100).
    
    Returns:
        list: A list of open issues (each issue is a JSON object).
    
    Raises:
        ValueError: If the GITHUB_TOKEN is not found.
        requests.HTTPError: For HTTP errors during API requests.
    """
    # Retrieve the GitHub API token from environment variables
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN not set in environment variables")
    
    # Common headers for both requests
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    all_issues = []
    page = 1
    while True:
        params = {
            "state": "open",
            "per_page": per_page,
            "page": page
        }
        issues_url = f"https://api.github.com/repos/{owner}/{repo}/issues"
        issues_response = requests.get(issues_url, headers=headers, params=params)
        issues_response.raise_for_status()
        issues_page = issues_response.json()
        
        if not issues_page:
            # No more issues on this page, break the loop.
            break
        
        for issue in issues_page:
            if "pull_request" not in issue:
                all_issues.append(issue.get('number'))
        page += 1

    return all_issues

def get_issue(owner: str, repo: str, issue_number: int) -> dict:
    """
    Retrieve details of a specific issue in a GitHub repository.
    
    Args:
        owner (str): The owner of the repository.
        repo (str): The repository name.
        issue_number (int): The issue number.
    
    Returns:
        dict: A dictionary containing the issue details.
    
    Raises:
        ValueError: If the GITHUB_TOKEN is not set in environment variables.
        requests.HTTPError: If any API request fails.
    """
    # Retrieve the GitHub API token from environment variables
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN not set in environment variables")
    
    # Define the base URL for fetching issue details
    base_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
    
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
    issue = response.json()
    
    return {"issue_number":issue.get('number'),"title":issue.get('title'),"body":issue.get('body')}
    

def get_all_issue_comments(owner: str, repo: str, issue_number: int, per_page: int = 100) -> list:
    """
    Retrieve all comments for a specific issue in a GitHub repository using pagination.
    
    Args:
        owner (str): The owner of the repository.
        repo (str): The repository name.
        issue_number (int): The issue number for which to fetch comments.
        per_page (int): Number of results per page (max 100).
    
    Returns:
        list: A list of comment objects (each comment is a JSON object).
    
    Raises:
        ValueError: If the GITHUB_TOKEN is not set in environment variables.
        requests.HTTPError: If any API request fails.
    """
    # Retrieve the GitHub API token from environment variables
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN not set in environment variables")
    
    # Define the base URL for fetching issue comments
    base_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments"
    
    # Set the required headers
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    all_comments = []
    page = 1

    while True:
        # Set pagination parameters
        params = {
            "per_page": per_page,
            "page": page
        }
        
        # Make the GET request to fetch comments for the current page
        response = requests.get(base_url, headers=headers, params=params)
        response.raise_for_status()  # Raise an error if the request failed
        
        # Parse the JSON response
        comments = response.json()
        
        # If no comments are returned, exit the loop
        if not comments:
            break
        
        all_comments.extend(comments)
        page += 1
        
    final_comments = []
    for comment in all_comments:
        final_comments.append(comment.get('user').get('login')+": "+comment.get('body'))

    return final_comments

def get_issue_lable_names(owner:str, repo:str, issue_number:int):
    """
    Retrieve all labels for a specific issue in a GitHub repository.
    
    Args:
        owner (str): The owner of the repository.
        repo (str): The repository name.
        issue_number (int): The issue number for which to fetch labels.
    
    Returns:
        list: A list of label objects (each label is a JSON object).
    
    Raises:
        ValueError: If the GITHUB_TOKEN is not set in environment variables.
        requests.HTTPError: If any API request fails.
    """
    # Retrieve the GitHub API token from environment variables
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN not set in environment variables")
    
    # Define the base URL for fetching issue labels
    base_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/labels"
    
    # Set the required headers
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    # Make the GET request to fetch labels for the issue
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()  # Raise an error if the request failed
    
    # Parse the JSON response
    labels = response.json()
    
    label_names = []
    for label in labels:
        label_names.append(label["name"])        
    
    return label_names


# Example usage:
if __name__ == "__main__":
    # Replace 'OWNER' and 'REPO' with the actual repository owner and name.
    owner = "grafana"
    repo = "grafana-app-sdk"
    
    try:
        open_issues = get_all_open_issues(owner, repo)
        print(f"\nTotal open issues retrieved: {len(open_issues)}")
        for issue in open_issues:
            print("Issue")
            print(issue)
            comments=get_all_issue_comments(owner, repo, issue.get('number'))
            print("Comments")
            print(comments)
            labels = get_issue_lable_names(owner, repo, issue.get('number'))
            print("Labels")
            print(labels)
            print("-------------------------------------------------------------------")
            
    except Exception as e:
        print(f"An error occurred: {e}")