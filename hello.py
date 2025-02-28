from openai import OpenAI
import json
import http.client

http.client.HTTPConnection.debuglevel = 1


def main():
    endpoint = "https://evfmyfj6b14scg-8000.proxy.runpod.net/v1"
    model_id = "trulience-org/llama-3.1-8b-instruct-x121-v2"

    client = OpenAI(base_url=endpoint, api_key="dummy")

    def order_sandwich(filling: str):
        return f"Ordering a sandwich with {filling}."

    def send_photo():
        return "Sending photo."

    tool_functions = {"order_sandwich": order_sandwich, "send_photo": send_photo}

    tools = [
        {
            "type": "function",
            "function": {
                "name": "order_sandwich",
                "description": "Place a sandwich order with a given filling.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filling": {
                            "type": "string",
                            "description": "Type of filling (e.g. 'Turkey', 'Ham', 'Veggie')",
                        }
                    },
                    "required": ["filling"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "send_photo",
                "description": "Request a photo to be sent.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
        },
    ]
    messages = [{"role": "user", "content": "make me a sandwich"}]
    response = client.chat.completions.create(
        model=model_id,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    # print(f"response: {response}")
    for choice in response.choices:
        message = choice.message
        if message.tool_calls:
            tool_call = message.tool_calls[0]
            func_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            print(f"Function called: {func_name}")
            print(f"Arguments: {arguments}")

            if func_name in tool_functions:
                result = tool_functions[func_name](**arguments)
                print(f"Result: {result}")


if __name__ == "__main__":
    main()
