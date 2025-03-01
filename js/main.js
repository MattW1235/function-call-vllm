import OpenAI from "openai";

const BASE_URL = "https://9lwhh5kkuiwrl9-8000.proxy.runpod.net/v1";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "dummy",
  baseURL: BASE_URL,
});

// Define tool functions
function order_sandwich(filling) {
  return `Ordering a sandwich with ${filling}.`;
}

function send_photo() {
  return "Sending photo.";
}

// Map tool function names to actual functions
const toolFunctions = {
  order_sandwich,
  send_photo,
};

// Define the available tools
const tools = [
  {
    type: "function",
    function: {
      name: "order_sandwich",
      description: "Place a sandwich order with a given filling.",
      parameters: {
        type: "object",
        properties: {
          filling: {
            type: "string",
            description: "Type of filling (e.g. 'Turkey', 'Ham', 'Veggie')",
          },
        },
        required: ["filling"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_photo",
      description: "Request a photo to be sent.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// Function to simulate chat interaction and process a response
async function main() {
  try {
    const messages = [
      {
        role: "user",
        content:
          // "send me a photo",
          "hello, how are you? can you make me a sandwich with ham filling?",
      },
    ];

    // Make an API request for chat completions
    const response = await openai.chat.completions.create({
      model: "trulience-org/llama-3.1-8b-instruct-x121-v2", // Replace with your actual model ID
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      stream: false,
    });

    // Process the API response
    for (const choice of response.choices || []) {
      const message = choice.message;
      if (message.tool_calls) {
        const toolCall = message.tool_calls[0];
        const funcName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`Function called: ${funcName}`);
        console.log(`Arguments: ${JSON.stringify(args)}`);

        // Call the corresponding function if it exists
        if (toolFunctions[funcName]) {
          const result = toolFunctions[funcName](...Object.values(args));
          console.log(`Result: ${result}`);
        } else {
          console.error(`No such function: ${funcName}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in processing chat:", error);
  }
}

// Run the main function
main();
