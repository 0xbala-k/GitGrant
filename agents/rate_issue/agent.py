import sys
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage

# Load environment variables (GitHub and OpenAI tokens)
load_dotenv()

example_input="""Here are the details related to the issue titled "Informer controller should have an exponential backoff in case of misconfigured finalizer":

### Issue Details
- **Title**: Informer controller should have an exponential backoff in case of misconfigured finalizer
- **Body**: 
  The issue describes a situation where switching from the `OpinionatedWatcher` implementation to `OpinionatedReconciler` caused a misconfiguration with finalizers. A resource was saved with a finalizer that did not match the existing one, leading to repeated attempts by the `InformerController` to reconcile, resulting in misleading logs. The user suggests two improvements:
  1. Warn the user about the misconfiguration.
  2. Provide a way to fix the issue by resorting to the newer value for existing objects.
  Additionally, it mentions the need to implement retry logic with exponential backoff to avoid infinite loops.

### Comments
1. **Comment by IfSentient**: Discusses the potential causes of the issue, including a bad RetryPolicy or continuous reconcile events triggered by patches. It emphasizes the need for more logging and tracing in the `OpinionatedReconciler`.
2. **Comment by charandas**: Clarifies that the issue occurred with an object already saved when the Watcher implementation was in place, and explains the naming conventions for finalizers in different implementations.

### Labels
Unfortunately, the labels for this issue were not retrieved in the response.

### Actionable Steps to Resolve the Issue
1. **Implement Exponential Backoff**:
   - Modify the retry logic in the `InformerController` to include exponential backoff when a misconfigured finalizer is detected.

2. **Add User Warnings**:
   - Implement a warning mechanism in the reconciliation process to alert users when there is a misconfiguration with finalizers.

3. **Logging and Debugging**:
   - Enhance logging in the `OpinionatedReconciler` to provide better insights into the reconciliation process and potential errors, as suggested in the comments.

4. **Review Finalizer Naming Conventions**:
   - Consider establishing a convention for finalizer naming in the `OpinionatedReconciler` to prevent similar issues in the future.

5. **Test Changes**:
   - Thoroughly test the changes in a development environment to ensure that the exponential backoff and warning mechanisms work as intended without causing additional issues.

6. **Documentation**:
   - Update the documentation to inform users about the new behavior regarding finalizers and the reconciliation process.

If you need any further assistance or specific details about any of these steps, feel free to ask!"""

def initialize_rating_agent(memory, config):
    """
    Initialize the agent that, using GitHub issue details and actionable steps,
    computes a rating (1-100) based on the issue's priority and difficulty.
    """
    # Initialize LLM.
    llm = ChatOpenAI(model="gpt-4o-mini")

    # Create a ReAct Agent that uses the same GitHub tools but with a modified state prompt.
    # This state_modifier instructs the agent to:
    # 1. Ask the user for the GitHub issue information and any actionable steps provided.
    # 2. Analyze the details (title, body, labels, comments, and actionable steps).
    # 3. Determine the issue's overall priority and difficulty.
    # 4. Return a final rating from 1 to 100 (with a brief explanation if needed).
    return create_react_agent(
        llm,
        tools=[],
        checkpointer=memory,
        state_modifier=(
            "\nYou are an expert in evaluating GitHub issues. When provided with the issue's details "
            "(including title, body, labels, and comments) along with actionable steps to resolve it, "
            "analyze the overall priority and difficulty of the issue. Based on your analysis, assign a final rating "
            "from 1 to 100 where a higher rating indicates a higher priority and more challenging issue. "
            "This rating will be used as a reward incentive for resolving the issue. "
            "Provide only the final rating."
        )
    ), config

def run_rating_chat_mode(agent_executor, config):
    """
    Run the rating agent interactively. The agent will prompt the user for GitHub issue details
    and actionable steps, then compute and output the issue rating.
    """
    print("Starting rating agent chat mode... Type 'exit' to end.")
    while True:
        try:
            user_input = input("\nUser: ")
            if user_input.lower() == "exit":
                break

            # Pass the user's message to the agent and stream the response.
            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=user_input)]}, config):
                if "agent" in chunk:
                    print(chunk["agent"]["messages"][0].content)
                elif "tools" in chunk:
                    print(chunk["tools"]["messages"][0].content)
                print("-------------------")
        except KeyboardInterrupt:
            print("Goodbye Rating Agent!")
            sys.exit(0)

if __name__ == "__main__":
    print("Starting Rating Agent...")
     # Store conversation history in memory.
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "1"}}
    agent_executor, config = initialize_rating_agent(memory, config)
    run_rating_chat_mode(agent_executor, config)