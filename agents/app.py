from flask import Flask, request, jsonify

from chain import init_chain

app = Flask(__name__)

# Initialize the chatbot
chain = init_chain()

@app.route('/invoke', methods=['POST'])
def invoke_chatbot():
    # Get the JSON state from the request.
    state = request.get_json()
    if state is None:
        return jsonify({'error': 'Invalid or missing JSON payload.'}), 400

    try:
        # Invoke the chain with the provided state.
        # TODO: change recursion limit based on action and issue count
        final_state = chain.invoke(state, {"recursion_limit": 100})
    except Exception as e:
        return jsonify({'error': f'Error while invoking chatbot: {str(e)}'}), 500

    # Return the final state as JSON.
    return jsonify(final_state), 200

if __name__ == '__main__':
    # Run the Flask development server.
    app.run(debug=True)
