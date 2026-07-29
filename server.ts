import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Supabase Admin Client (使用 service_role key，绕过所有限制)
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);


const app = express();
const PORT = 3000;

app.use(express.json());

// ====== Auth 接口 ======

// 手机号转邮箱（与前端保持一致）
function phoneToEmail(phone: string): string {
  return phone.replace(/[^0-9]/g, "") + "@phone.example.com";
}

// 注册：使用 Admin API 直接创建用户，自动确认，无邮件限制
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "请填写手机号和密码" });
    }
    const email = phoneToEmail(phone);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone },
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "注册失败" });
  }
});

// Initialize Gemini AI Client
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// AI Endpoint: Generate Inspiration Note or Refine Thoughts
app.post("/api/ai/inspire", async (req, res) => {
  try {
    const { topic, mode } = req.body;
    const ai = getAi();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    let prompt = "";
    if (mode === "quote") {
      prompt = `请为极简思考应用 MindFlow 生成一句深刻而精炼的心流/认知心理学语录，包含作者姓名。输出 JSON 格式: {"quote": "语录内容...", "author": "作者"}`;
    } else if (mode === "task_breakdown") {
      prompt = `请针对任务"${topic || "项目规划"}"，生成3条精炼可执行的具体步骤。输出 JSON 格式: {"steps": ["步骤1", "步骤2", "步骤3"]}`;
    } else {
      prompt = `请围绕主题"${topic || "极简思考与深度专注"}"生成一篇充满审美美感与建筑/心理学哲理的短笔记。输出 JSON 格式: {"title": "标题", "tag": "灵感", "excerpt": "简短一两句摘要...", "content": "详细笔记正文..."}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: err.message || "AI generation failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MindFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
