var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_vite = require("vite");
import_dotenv.default.config();
var supabaseAdmin = (0, import_supabase_js.createClient)(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
function phoneToEmail(phone) {
  return phone.replace(/[^0-9]/g, "") + "@phone.example.com";
}
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "\u8BF7\u586B\u5199\u624B\u673A\u53F7\u548C\u5BC6\u7801" });
    }
    const email = phoneToEmail(phone);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone }
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || "\u6CE8\u518C\u5931\u8D25" });
  }
});
var QWEN_API_KEY = process.env.QWEN_API_KEY || "";
var QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
async function callQwen(prompt) {
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: "qwen-turbo",
      // 免费模型
      messages: [
        { role: "system", content: "\u4F60\u662F MindFlow \u5E94\u7528\u7684 AI \u521B\u4F5C\u52A9\u624B\uFF0C\u8BF7\u59CB\u7EC8\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\uFF0C\u4E0D\u8981\u52A0 markdown \u4EE3\u7801\u5757\u6807\u8BB0\u3002" },
        { role: "user", content: prompt }
      ],
      max_tokens: 2048,
      temperature: 0.8
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API error (${response.status}): ${errText}`);
  }
  const result = await response.json();
  return result.choices[0].message.content;
}
app.post("/api/ai/inspire", async (req, res) => {
  try {
    const { topic, mode } = req.body;
    if (!QWEN_API_KEY) {
      return res.status(500).json({
        error: "QWEN_API_KEY is not configured."
      });
    }
    let prompt = "";
    if (mode === "quote") {
      prompt = `\u8BF7\u4E3A\u6781\u7B80\u601D\u8003\u5E94\u7528 MindFlow \u751F\u6210\u4E00\u53E5\u6DF1\u523B\u800C\u7CBE\u70BC\u7684\u5FC3\u6D41/\u8BA4\u77E5\u5FC3\u7406\u5B66\u8BED\u5F55\uFF0C\u5305\u542B\u4F5C\u8005\u59D3\u540D\u3002\u8F93\u51FA JSON \u683C\u5F0F: {"quote": "\u8BED\u5F55\u5185\u5BB9...", "author": "\u4F5C\u8005"}`;
    } else if (mode === "task_breakdown") {
      prompt = `\u8BF7\u9488\u5BF9\u4EFB\u52A1"${topic || "\u9879\u76EE\u89C4\u5212"}"\uFF0C\u751F\u62103\u6761\u7CBE\u70BC\u53EF\u6267\u884C\u7684\u5177\u4F53\u6B65\u9AA4\u3002\u8F93\u51FA JSON \u683C\u5F0F: {"steps": ["\u6B65\u9AA41", "\u6B65\u9AA42", "\u6B65\u9AA43"]}`;
    } else if (mode === "polish") {
      const userContent = req.body.content || "";
      prompt = `\u8BF7\u5E2E\u6211\u6DA6\u8272\u548C\u62D3\u5C55\u4EE5\u4E0B\u7B14\u8BB0\u5185\u5BB9\uFF0C\u4FDD\u6301\u539F\u610F\u7684\u57FA\u7840\u4E0A\u8BA9\u8BED\u8A00\u66F4\u52A0\u4F18\u7F8E\u6D41\u7545\u3001\u5BCC\u6709\u6DF1\u5EA6\u3002\u8F93\u51FA JSON \u683C\u5F0F: {"title": "\u6DA6\u8272\u540E\u7684\u6807\u9898", "tag": "\u7075\u611F", "excerpt": "\u7B80\u77ED\u6458\u8981", "content": "\u6DA6\u8272\u540E\u7684\u5B8C\u6574\u7B14\u8BB0"}

\u539F\u59CB\u5185\u5BB9\uFF1A
\u6807\u9898\uFF1A${topic || ""}
\u6B63\u6587\uFF1A${userContent}`;
    } else {
      prompt = `\u8BF7\u56F4\u7ED5\u4E3B\u9898"${topic || "\u6781\u7B80\u601D\u8003\u4E0E\u6DF1\u5EA6\u4E13\u6CE8"}"\u751F\u6210\u4E00\u7BC7\u5145\u6EE1\u5BA1\u7F8E\u7F8E\u611F\u4E0E\u5EFA\u7B51/\u5FC3\u7406\u5B66\u54F2\u7406\u7684\u77ED\u7B14\u8BB0\u3002\u8F93\u51FA JSON \u683C\u5F0F: {"title": "\u6807\u9898", "tag": "\u7075\u611F", "excerpt": "\u7B80\u77ED\u4E00\u4E24\u53E5\u6458\u8981...", "content": "\u8BE6\u7EC6\u7B14\u8BB0\u6B63\u6587..."}`;
    }
    const resultText = await callQwen(prompt);
    const data = JSON.parse(resultText);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Qwen API Error:", err);
    return res.status(500).json({ error: err.message || "AI generation failed" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MindFlow server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
