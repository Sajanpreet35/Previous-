export default async function handler(req, res) {
  const { q } = req.body;

  // Load memory from GitHub raw
  const memoryRes = await fetch(
    "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/memory.json"
  );
  let memory = await memoryRes.json();

  // Auto knowledge: Wikipedia summary + Public API news
  let wiki = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary")
        .then(r => r.json()).catch(()=>({}));

  let news = await fetch("https://api.publicapis.org/entries")
        .then(r => r.json()).catch(()=>({entries:[]}));

  memory.knowledge.push({
      time: Date.now(),
      wiki: { title: wiki.title || "", desc: wiki.extract || "" },
      news: news.entries.slice(0, 3)
  });

  // Deep prompt
  let prompt = `
You are ULTRA DEEP AI.
You have:
- Unlimited memory 
- Auto-learning
- Auto knowledge collection
- Wikipedia + News + Research analyzer
- Very deep reasoning

MEMORY:
${JSON.stringify(memory).slice(0,7000)}

User: ${q}
AI:`;


  // LLM call
  let llm = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.GROQ_KEY
      },
      body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }]
      })
  });

  let data = await llm.json();
  let answer = data.choices[0].message.content;

  // Save conversation back (GitHub write API requires PAT — skip in free version)
  memory.conversation.push({ q, a: answer });

  // Response to frontend
  res.status(200).json({ a: answer });
}
