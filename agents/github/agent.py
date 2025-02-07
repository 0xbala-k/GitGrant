import sys
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage

from github.issues import get_issue,get_all_issue_comments,get_issue_lable_names

# Load environment variables (OpenAI token)
load_dotenv()

def initialize_github_agent(memory, config):
    """Initialize the agent with github tools."""
    # Initialize LLM.
    llm = ChatOpenAI(model="gpt-4o-mini")

    # Create ReAct Agent using the LLM and CDP Agentkit tools.
    return create_react_agent(
        llm,
        tools=[get_issue,get_all_issue_comments,get_issue_lable_names],
        checkpointer=memory,
        state_modifier="Ask the user for issue info and use the tools to get issue title, body, labels, and comments."\
                "Based on the details you get from tools, provide a list of clear, actionable steps to resolve this issue. " \
              "If you require any additional details regarding the repository or the issue for a more accurate diagnosis, " \
              "please specify what extra information is needed."
    ), config

def run_chat_mode(agent_executor, config):
    """Run the agent interactively based on user input."""
    print("Starting chat mode... Type 'exit' to end.")
    while True:
        try:
            user_input = input("\nUser: ")
            if user_input.lower() == "exit":
                break

            # Run agent with the user's input in chat mode
            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=user_input)]}, config):
                if "agent" in chunk:
                    print(chunk["agent"]["messages"][0].content)
                elif "tools" in chunk:
                    print(chunk["tools"]["messages"][0].content)
                print("-------------------")

        except KeyboardInterrupt:
            print("Goodbye Agent!")
            sys.exit(0)

if __name__ == "__main__":
    # Store buffered conversation history in memory.
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "1"}}
    
    print("Starting Agent...")
    agent_executor, config = initialize_github_agent(memory, config)
    run_chat_mode(agent_executor, config)