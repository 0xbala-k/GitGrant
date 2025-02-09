// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GitGrant {
    // The wallet address that controls the state of the contract.
    address public owner;

    // Mapping from GitHub username to the user's wallet address.
    mapping(string => address) public userWallets;

    // Mapping from repository name to its RepoState.
    mapping(string => RepoState) public repoStates;

    // Struct representing an issue.
    struct Issue {
        uint issueNumber;
        uint difficultyRating;
    }

    // Struct representing the state for a GitHub repo.
    struct RepoState {
        string githubOwnerName;
        string githubOwnerRepo;
        uint remainingBudget; // in wei
        Issue[] issueRatings;
        uint ratingSum;
    }

    // Modifier to restrict functions to only the contract owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    // Set the deployer as the owner.
    constructor(address agent) {
        owner = agent;
    }

    // Custom getter to retrieve the complete issues array.
    function getRepoIssues(
        string memory repoName
    ) public view returns (Issue[] memory) {
        return repoStates[repoName].issueRatings;
    }

    /// @notice Register a GitHub user by mapping their GitHub username to their wallet address.
    /// @param username The GitHub username.
    /// @param wallet The wallet address for that user.
    function registerUser(
        string memory username,
        address wallet
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        userWallets[username] = wallet;
    }

    /// @notice Register a new repository.
    /// @param repoName The unique identifier for the repo (used as a key).
    /// @param githubOwnerName The GitHub username of the repo owner.
    /// @param githubRepoName The repository name on GitHub.
    function registerRepo(
        string memory repoName,
        string memory githubOwnerName,
        string memory githubRepoName
    ) external onlyOwner {
        // Ensure that this repo has not been registered already.
        require(
            bytes(repoStates[repoName].githubOwnerName).length == 0,
            "Repo already registered"
        );

        // Initialize the RepoState.
        RepoState storage repo = repoStates[repoName];
        repo.githubOwnerName = githubOwnerName;
        repo.githubOwnerRepo = githubRepoName;
        repo.remainingBudget = 0;
        repo.ratingSum = 0;
    }

    /// @notice Deposit funds to a repository’s budget.
    /// @dev The function is payable so funds (in wei) can be sent.
    /// @param repoName The repository name to which funds should be added.
    function depositFunds(string memory repoName) external payable {
        require(msg.value > 0, "Must send some ether");
        require(
            bytes(repoStates[repoName].githubOwnerName).length > 0,
            "Repo not registered"
        );

        // Add the sent funds to the repo's remaining budget.
        repoStates[repoName].remainingBudget += msg.value;
    }

    /// @notice Update repository’s list of issues and update its rating sum.
    /// @param repoName The repository to update.
    /// @param issueNumbers updated issues.
    /// @param difficultyRatings updated  ratings.
    /// @param totalRating total difficulty ratings for all the issues.
    function updateIssues(
        string memory repoName,
        uint256[] memory issueNumbers,
        uint256[] memory difficultyRatings,
        uint totalRating
    ) external onlyOwner {
        require(
            bytes(repoStates[repoName].githubOwnerName).length > 0,
            "Repo not registered"
        );

        require(
            issueNumbers.length == difficultyRatings.length,
            "Array lengths mismatch"
        );

        RepoState storage repo = repoStates[repoName];

        // Clear the existing issues array.
        delete repo.issueRatings;

        // Rebuild the issues array from the two parallel arrays.
        for (uint i = 0; i < issueNumbers.length; i++) {
            repo.issueRatings.push(
                Issue(issueNumbers[i], difficultyRatings[i])
            );
        }

        repo.ratingSum = totalRating;
    }

    /// @notice Resolve an issue: remove it from the issues list, update the rating sum,
    ///         subtract the payout amount from the remaining budget, and transfer the payout
    ///         to the GitHub user’s wallet.
    /// @param repoName The repository where the issue exists.
    /// @param issueNumber The issue number to resolve.
    /// @param githubUsername The GitHub username of the contributor receiving funds.
    /// @param amount The amount (in wei) to pay out.
    function resolveIssue(
        string memory repoName,
        uint issueNumber,
        string memory githubUsername,
        uint amount
    ) external onlyOwner {
        RepoState storage repo = repoStates[repoName];
        require(bytes(repo.githubOwnerName).length > 0, "Repo not registered");

        // Find the issue by its issueNumber.
        bool found = false;
        uint index;
        uint issueRating;
        for (uint i = 0; i < repo.issueRatings.length; i++) {
            if (repo.issueRatings[i].issueNumber == issueNumber) {
                found = true;
                index = i;
                issueRating = repo.issueRatings[i].difficultyRating;
                break;
            }
        }
        require(found, "Issue not found");

        // Remove the issue from the issues array by swapping with the last element and then popping.
        repo.issueRatings[index] = repo.issueRatings[
            repo.issueRatings.length - 1
        ];
        repo.issueRatings.pop();

        // Subtract the issue's difficulty rating from the rating sum.
        require(repo.ratingSum >= issueRating, "Rating sum underflow");
        repo.ratingSum -= issueRating;

        // Ensure there are enough funds in the repo's remaining budget.
        require(
            repo.remainingBudget >= amount,
            "Insufficient remaining budget"
        );
        repo.remainingBudget -= amount;

        // Lookup the wallet address for the given GitHub username.
        address payable userWallet = payable(userWallets[githubUsername]);
        require(userWallet != address(0), "User wallet not registered");

        // Transfer the payout amount.
        userWallet.transfer(amount);
    }

    // Optionally, a receive function to accept plain ETH transfers.
    // receive() external payable {}
}
