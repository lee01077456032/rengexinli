import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Server API Routes
app.post("/api/gemini/analyze", async (req: express.Request, res: express.Response) => {
  try {
    const { personalitySystem, personalityType, question, history } = req.body;

    if (!personalityType || !question) {
      return res.status(400).json({ error: "Missing personalityType or question" });
    }

    const systemInstruction = `你是一位专业、富有同情心的心理学家和人格分析专家，精通MBTI（16型人格）、九型人格（Enneagram）以及大五人格（Big Five）体系。
你的任务是结合用户的人格类型和他们目前面临的具体问题或困扰，进行深刻的心理学剖析，并提供个性化、切实可行的解决方案。

在回答时，应当：
1. 【人格特质剖析】：深度解析该人格在面对该问题时，其固有的思维模式、盲区或优势是如何起作用的。
2. 【心理共情与接纳】：以温柔、客观、富有共情力的语气肯定用户的感受，缓解他们的焦虑和自我否定。
3. 【定制化解题方案】：针对用户提出的人格，给出3-4条具体、可操作的行动建议或心理调节技巧。
4. 【心理练习推荐】：提供一个对应其性格的简易心理学练习（如正念、认知重构、书写疗愈等）。

请使用排版考究、格式清晰的中文回答，使用Markdown语法以增加易读性。`;

    // Construct the chat contents containing history and the new question
    const contents: any[] = [];
    
    // Add history if present
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current question
    const currentPrompt = `我的人格体系是【${personalitySystem}】，具体类型是【${personalityType}】。我目前面临的心理困扰/问题是：
"${question}"

请为我进行深度心理学剖析，并给出解决此困扰的定制建议。`;

    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text;
    res.json({ result: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

async function start() {
  // Vite frontend routing middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Fatal: Server failure during boot", err);
});
