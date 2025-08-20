import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAgent() {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Hello, how are you?",
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  console.log(completion.choices[0]?.message?.content || "");
}
