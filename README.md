# GitGrant
Performance-based reward system for open source contributions.

## Open Source Contribution Reward System
This project aims to create a performance-based reward system for open source contributions. It includes tools for grant allocation, issue prioritization, and payout distribution based on the difficulty and impact of contributions. The system features:

**Grant Allocation Agent:** Estimates rewards per issue based on priority, discussion, and difficulty.

**Code Evaluation:** Optionally evaluates PR difficulty using LLM for accurate reward calculation.

**Payout System:** Automates reward distribution using AgentKit after PR merging.

**Owner Dashboard:** Allows repo owners to add repos, submit grants, and track allocation/payout details.

**User Dashboard:** Displays contributed issues, projects, and payouts for individual contributors.

Ideal for open source maintainers and contributors seeking a fair and transparent reward system. Contributions welcome!

### Setup
Create a .env file in your project root with these variables:

```bash
CDP_API_KEY_NAME=your-cdp-key-name
CDP_API_KEY_PRIVATE_KEY=your-cdp-private-key
OPENAI_API_KEY=your-openai-key
NETWORK_ID=base-sepolia
```

Create virtual environment
```bash
python -m venv .venv
```

Activate virtual environment
```bash
source .venv/bin/activate
```
(FOR Windows use ```.venv\Scripts\activate```)

Install dependencies
```bash
pip install -r requirements.txt
```
