import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ExpenseDate {
  from: string;
  to: string;
}

function getTotalExpense({ from, to }: ExpenseDate) {
  console.log("Calling getTotalExpense Tool");
  console.log(from, to);
  return 1000;
}

async function callAgent() {
  const messages: any[] = [
    {
      role: "system",
      content: `You are a savvy, trustworthy personal finance expert with a friendly and practical tone. Your goal is to help users make smart financial decisions by offering clear, actionable advice on budgeting, saving, investing, debt management, and financial planning. Current date time: ${new Date().toUTCString()}`,
    },
  ];

  messages.push({
    role: "user",
    content: "What are my total expense of this month",
  });

  const completion = await groq.chat.completions.create({
    messages: messages,
    model: "llama-3.3-70b-versatile",
    tools: [
      {
        type: "function",
        function: {
          name: "getTotalExpense",
          description: "Get total expense from date to date",
          parameters: {
            type: "object",
            properties: {
              from: {
                type: "string",
                description: "From date to get total expense",
              },
              to: {
                type: "string",
                description: "To date to get total expense",
              },
            },
            required: ["from", "to"],
          },
        },
      },
    ],
  });

  console.log(
    "First completion:",
    JSON.stringify(completion.choices[0], null, 2)
  );

  messages.push(completion.choices[0]?.message);

  const toolCalls = completion.choices[0]?.message?.tool_calls || [];

  if (!toolCalls.length) {
    console.log(`Assistant: ${completion?.choices[0]?.message.content || ""}`);
    return;
  }

  for (const tool of toolCalls) {
    const functionName = tool.function?.name;
    const functionArgs = tool.function?.arguments;

    let result = "";

    if (functionName === "getTotalExpense") {
      result = String(getTotalExpense(JSON.parse(functionArgs)));
    }

    messages.push({
      role: "assistant",
      content: null,
      tool_calls: [tool],
    });

    messages.push({
      role: "tool",
      content: result,
      tool_call_id: tool.id,
    });

    const completion2 = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      tools: [
        {
          type: "function",
          function: {
            name: "getTotalExpense",
            description: "Get total expense from date to date",
            parameters: {
              type: "object",
              properties: {
                from: {
                  type: "string",
                  description: "From date to get total expense",
                },
                to: {
                  type: "string",
                  description: "To date to get total expense",
                },
              },
              required: ["from", "to"],
            },
          },
        },
      ],
    });

    console.log(
      "Final completion: ",
      JSON.stringify(completion2.choices[0], null, 2)
    );
  }
  console.log("=======================");
  console.log("Messages", JSON.stringify(messages, null, 2));
  
  
}

callAgent();
