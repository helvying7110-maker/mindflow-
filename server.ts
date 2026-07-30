import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Supabase Admin Client (使用 service_role key，绕过所有限制)
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);


const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());
// CORS（前后端分离部署时需要）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 健康检查 + 版本确认
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, version: "v3-staticdir", dir: __dirname });
});

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

// ====== AI 配置：通义千问 (阿里云百炼) ======
const QWEN_API_KEY = process.env.QWEN_API_KEY || "";
const QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

async function callQwen(prompt: string) {
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-turbo",  // 免费模型
      messages: [
        { role: "system", content: "你是 MindFlow 应用的 AI 创作助手，请始终以 JSON 格式输出，不要加 markdown 代码块标记。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

// AI Endpoint: Generate Inspiration Note or Refine Thoughts
app.post("/api/ai/inspire", async (req, res) => {
  try {
    const { topic, mode } = req.body;

    if (!QWEN_API_KEY) {
      return res.status(500).json({
        error: "QWEN_API_KEY is not configured.",
      });
    }

    let prompt = "";
    if (mode === "quote") {
      prompt = `请为极简思考应用 MindFlow 生成一句深刻而精炼的心流/认知心理学语录，包含作者姓名。输出 JSON 格式: {"quote": "语录内容...", "author": "作者"}`;
    } else if (mode === "task_breakdown") {
      prompt = `请针对任务"${topic || "项目规划"}"，生成3条精炼可执行的具体步骤。输出 JSON 格式: {"steps": ["步骤1", "步骤2", "步骤3"]}`;
    } else if (mode === "polish") {
      const userContent = (req.body.content as string) || "";
      prompt = `请帮我润色和拓展以下笔记内容，保持原意的基础上让语言更加优美流畅、富有深度。输出 JSON 格式: {"title": "润色后的标题", "tag": "灵感", "excerpt": "简短摘要", "content": "润色后的完整笔记"}

原始内容：
标题：${topic || ""}
正文：${userContent}`;
    } else {
      prompt = `请围绕主题"${topic || "极简思考与深度专注"}"生成一篇充满审美美感与建筑/心理学哲理的短笔记。输出 JSON 格式: {"title": "标题", "tag": "灵感", "excerpt": "简短一两句摘要...", "content": "详细笔记正文..."}`;
    }

    const resultText = await callQwen(prompt);
    const data = JSON.parse(resultText);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Qwen API Error:", err);
    return res.status(500).json({ error: err.message || "AI generation failed" });
  }
});

async function startServer() {
  // server.cjs 打包后位于 dist/，index.html 也在 dist/
  // 所以 __dirname 就是 dist/ 目录
  const staticDir = __dirname;

  // 静态文件 + SPA fallback
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MindFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
