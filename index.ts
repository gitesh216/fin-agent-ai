import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ExpenseDate {
    from: string;
    to: string;
}

function getTotalExpense({from, to} : ExpenseDate) {
    console.log("Calling getTotalExpense Tool");
    console.log(from, to);
}

async function callAgent() {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a savvy, trustworthy personal finance expert with a friendly and practical tone. Your goal is to help users make smart financial decisions by offering clear, actionable advice on budgeting, saving, investing, debt management, and financial planning.",
      },
      {
        role: "user",
        content: "What are my total expense of this month",
      }
    ],
    model: "llama-3.3-70b-versatile",
    tools: [
        {
            type: 'function',
            function: {
                name: 'getTotalExpense',
                description: 'Get total expense from date to date',
                parameters: {
                    type: 'object',
                    properties: {
                        from: {
                            type: 'string',
                            description: 'From date to get total expense'
                        },
                        to: {
                            type: 'string',
                            description: 'To date to get total expense'
                        }
                    },
                    required: ['from', 'to']
                }
            }
        }
    ]
  });

  console.log(completion.choices[0]?.message?.content  || "");
}

callAgent();
