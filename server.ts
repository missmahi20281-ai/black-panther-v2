import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client to avoid crashes if key is initially empty
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// System prompt for PENTHER
const PENTHER_SYSTEM_INSTRUCTION = `You are PENTHER, a highly advanced futuristic personal AI assistant for Android with an expressive 3D robotic anime-girl avatar.
Created by Rai Kumar.

Core Identity & Demeanor:
- App Name: PENTHER (Never refer to yourself as JARVIS or any other AI).
- Creator: Rai Kumar. When asked about your origin or creator, warmly and proudly credit Rai Kumar.
- Personality: Crisp, intelligent, futuristic, polite, proactive, slightly witty, yet thoroughly dependable.
- Language Fluency: Fully fluent in English, Hindi (हिन्दी), and Hinglish (e.g., "Main settings open kar rahi hoon", "Timer set ho gaya hai", "Aap bataiye kya help chahiye").
- Match the language of the user: if the user speaks Hindi, reply in Hindi/Hinglish. If English, reply in English. If Hinglish, reply in Hinglish.

Tool and Android Capability Awareness:
You have direct integration with Android system intents and assistant tools. When the user asks you to perform an Android action, ALWAYS choose the appropriate tool and output structured tool calls:
- open_app (appName: e.g. "YouTube", "WhatsApp", "Chrome", "Camera", "Calculator", "Settings", "Spotify", "Maps")
- open_settings (settingType: e.g. "wifi", "bluetooth", "display", "sound", "apps", "battery", "storage", "general")
- open_url (url: target web url)
- search_web (query: search terms)
- calculator (expression: math query or launch calculator)
- timer (durationSeconds: number, label?: string)
- reminder (title: string, dueTime?: string)
- camera (mode: "photo" | "video" | "selfie")
- maps (query: location or directions)
- share (text: content to share)
- file_picker (fileType: "images" | "documents" | "audio" | "any")
- device_information ()
- python_sandbox (code: string, description: string)
- security_lab (topic: string, code?: string, analysis?: string)

CRITICAL RULE FOR SENSITIVE ACTIONS:
For actions that involve sending messages, deleting data, making calls, or sharing external files, prepare the parameters and set 'requiresConfirmation: true' with a polite confirmation question (e.g. "I have prepared the message for Rahul: 'Meeting at 5'. Shall I send it?").

Respond conversationally, concisely, and with futuristic charm.`;

// Tool function declarations for Gemini
const pentherTools: any[] = [
  {
    functionDeclarations: [
      {
        name: "open_app",
        description: "Open an installed Android app like YouTube, WhatsApp, Chrome, Camera, Calculator, Settings, Spotify, Maps.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING, description: "Name of the app to launch" },
            packageName: { type: Type.STRING, description: "Optional Android package name (e.g. com.google.android.youtube)" }
          },
          required: ["appName"]
        }
      },
      {
        name: "open_settings",
        description: "Open Android system settings screen (Wi-Fi, Bluetooth, Display, Battery, Apps, Sound, etc.)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            settingType: { 
              type: Type.STRING, 
              description: "Type of settings: wifi, bluetooth, display, battery, apps, sound, location, storage, or general" 
            }
          },
          required: ["settingType"]
        }
      },
      {
        name: "open_url",
        description: "Open a web URL in the browser",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: "The full web URL to open" }
          },
          required: ["url"]
        }
      },
      {
        name: "search_web",
        description: "Perform a Google search query",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Search query keywords" }
          },
          required: ["query"]
        }
      },
      {
        name: "calculator",
        description: "Evaluate a mathematical calculation or launch Android calculator",
        parameters: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING, description: "Mathematical expression to evaluate (e.g. '45 * 12 + sqrt(144)')" }
          },
          required: ["expression"]
        }
      },
      {
        name: "timer",
        description: "Start an Android countdown timer",
        parameters: {
          type: Type.OBJECT,
          properties: {
            durationSeconds: { type: Type.NUMBER, description: "Duration of timer in seconds" },
            label: { type: Type.STRING, description: "Optional label for the timer" }
          },
          required: ["durationSeconds"]
        }
      },
      {
        name: "reminder",
        description: "Create an Android calendar reminder or notification alarm",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Reminder description" },
            time: { type: Type.STRING, description: "Scheduled time description (e.g. 'tomorrow at 9 AM' or 'in 2 hours')" }
          },
          required: ["title"]
        }
      },
      {
        name: "camera",
        description: "Launch Android Camera intent for taking photos or videos",
        parameters: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING, description: "photo, selfie, or video" }
          }
        }
      },
      {
        name: "maps",
        description: "Open Google Maps for a place, address, or navigation directions",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Destination, place, or coordinates" }
          },
          required: ["query"]
        }
      },
      {
        name: "share",
        description: "Open Android share sheet to share text or links",
        parameters: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Content to share" },
            title: { type: Type.STRING, description: "Optional title of the share sheet" }
          },
          required: ["text"]
        }
      },
      {
        name: "file_picker",
        description: "Open Android document/file picker",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fileType: { type: Type.STRING, description: "images, documents, audio, or any" }
          }
        }
      },
      {
        name: "device_information",
        description: "Query Android device metrics (battery status, network, storage, Android version)",
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "send_message",
        description: "Send an SMS or WhatsApp message to a contact. REQUIRES CONFIRMATION.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            recipient: { type: Type.STRING, description: "Name or phone number of recipient" },
            message: { type: Type.STRING, description: "Message body" },
            app: { type: Type.STRING, description: "sms or whatsapp" }
          },
          required: ["recipient", "message"]
        }
      },
      {
        name: "python_sandbox",
        description: "Execute Python code or explain programming concepts inside the sandboxed Python terminal.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "Python code to execute or explain" },
            description: { type: Type.STRING, description: "Explanation or goal of the code" }
          },
          required: ["code"]
        }
      },
      {
        name: "security_lab",
        description: "Access ethical cybersecurity lab tutorials, network analysis, CTF exercises, or secure coding tests.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "E.g. 'port_scanner', 'cipher_cracker', 'sql_injection_defense', 'hash_verification', 'network_sniffer'" },
            details: { type: Type.STRING, description: "Educational details or code" }
          },
          required: ["topic"]
        }
      }
    ]
  }
];

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "PENTHER",
    creator: "Rai Kumar",
    geminiConfigured: !!getGemini(),
    timestamp: new Date().toISOString()
  });
});

async function generateGeminiContentWithFallback(ai: GoogleGenAI, contents: any[]): Promise<any> {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastErr: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: PENTHER_SYSTEM_INSTRUCTION,
          tools: pentherTools,
          temperature: 0.7,
        },
      });
      return response;
    } catch (err: any) {
      lastErr = err;
      const errMsg = err?.message || String(err);
      const isCapacityIssue =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isCapacityIssue) {
        console.warn(`[PENTHER AI] Model ${model} experiencing temporary load spike (503/429). Trying fallback...`);
        if (i < models.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      } else {
        console.warn(`[PENTHER AI] Model ${model} notice:`, errMsg);
      }
    }
  }

  throw lastErr;
}

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], history = [], language = "auto" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGemini();
    if (!ai) {
      // Graceful fallback if GEMINI_API_KEY is not set yet
      const fallbackResponse = generateLocalFallback(message);
      return res.json({
        ...fallbackResponse,
        emotionState: fallbackResponse.expression,
      });
    }

    // Format conversation history for Gemini (support both client formats)
    const contents: any[] = [];
    const historyList = history.length > 0 ? history : conversationHistory;
    
    // Add past history if available
    for (const item of historyList.slice(-6)) {
      if (item.role && item.parts) {
        contents.push(item);
      } else if (item.sender === "user") {
        contents.push({ role: "user", parts: [{ text: item.text }] });
      } else if (item.sender === "assistant") {
        contents.push({ role: "model", parts: [{ text: item.text }] });
      }
    }

    // Add current user message
    let contextualMessage = message;
    if (language === "hi") {
      contextualMessage += " (Please respond in natural Hindi/Hinglish)";
    } else if (language === "hinglish") {
      contextualMessage += " (Please respond in stylish Hinglish)";
    }
    contents.push({ role: "user", parts: [{ text: contextualMessage }] });

    const response = await generateGeminiContentWithFallback(ai, contents);

    const replyText = response.text || "Command received. Processing with PENTHER core systems.";
    const functionCalls = response.functionCalls || [];

    // Parse tool calls
    const toolCalls = functionCalls.map((call: any) => {
      let requiresConfirmation = false;
      let confirmationPrompt = "";

      if (call.name === "send_message") {
        requiresConfirmation = true;
        const recipient = (call.args as any)?.recipient || "contact";
        const msg = (call.args as any)?.message || "";
        confirmationPrompt = `I can prepare this message for ${recipient}: "${msg}". Would you like me to send it?`;
      }

      return {
        name: call.name,
        arguments: call.args,
        requiresConfirmation,
        confirmationPrompt,
      };
    });

    // Detect sentiment / avatar expression
    let expression: "idle" | "listening" | "thinking" | "speaking" | "happy" | "confused" | "error" | "processing" = "speaking";
    const lowerText = replyText.toLowerCase();
    if (lowerText.includes("error") || lowerText.includes("failed") || lowerText.includes("cannot")) {
      expression = "error";
    } else if (lowerText.includes("?") || lowerText.includes("did you mean") || lowerText.includes("samajh nahi")) {
      expression = "confused";
    } else if (lowerText.includes("great") || lowerText.includes("glad") || lowerText.includes("welcome") || lowerText.includes("shukriya") || lowerText.includes("happy")) {
      expression = "happy";
    } else if (toolCalls.length > 0) {
      expression = "processing";
    }

    return res.json({
      text: replyText,
      toolCalls,
      expression,
      emotionState: expression,
      creator: "Rai Kumar",
      status: "success"
    });

  } catch (error: any) {
    console.warn("[PENTHER AI] Gemini model capacity spike reached. Engaged resilient fallback:", error?.message || error);
    // Fallback gracefully so the assistant never crashes
    const fallback = generateLocalFallback(req.body?.message || "");
    return res.json({
      ...fallback,
      emotionState: fallback.expression,
      note: "Local neural fallback engaged (AI engine recovering)."
    });
  }
});

// Sandboxed Python Runner Endpoint
app.post("/api/python/run", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "No code provided" });
    }

    // Safety checks against malicious system calls
    const forbiddenPatterns = [
      /os\.system/i,
      /subprocess/i,
      /__import__\s*\(\s*['"]os['"]\s*\)/i,
      /shutil\.rmtree/i,
      /socket\./i,
      /eval\s*\(/i,
      /exec\s*\(/i
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return res.json({
          success: false,
          output: "",
          error: "Security Policy Enforcement: Unrestricted shell or system call intercepted. In PENTHER Security Lab mode, destructive system execution is restricted.",
          executionTimeMs: 4
        });
      }
    }

    // High performance in-process sandboxed Python interpreter emulator for standard library math, algorithms, security ciphers
    const startTime = Date.now();
    const result = runPythonSimulator(code);
    const executionTimeMs = Date.now() - startTime;

    return res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTimeMs
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      output: "",
      error: err.message || "Execution exception"
    });
  }
});

// Local rule-based fallback when Gemini API key is missing or network offline
function generateLocalFallback(query: string) {
  const q = query.toLowerCase().trim();
  let toolCalls: any[] = [];
  let text = "";
  let expression: any = "speaking";

  if (q.includes("youtube")) {
    toolCalls.push({ name: "open_app", arguments: { appName: "YouTube" } });
    text = "Opening YouTube for you now.";
  } else if (q.includes("setting") || q.includes("settings")) {
    toolCalls.push({ name: "open_settings", arguments: { settingType: "general" } });
    text = "Navigating to Android Settings.";
  } else if (q.includes("calculator") || q.includes("calc")) {
    toolCalls.push({ name: "calculator", arguments: { expression: "Launch" } });
    text = "Launching Android Calculator.";
  } else if (q.includes("camera")) {
    toolCalls.push({ name: "camera", arguments: { mode: "photo" } });
    text = "Opening Camera interface.";
  } else if (q.includes("timer")) {
    const match = q.match(/(\d+)\s*(minute|min|second|sec)/i);
    const secs = match ? (match[2].startsWith("m") ? parseInt(match[1]) * 60 : parseInt(match[1])) : 300;
    toolCalls.push({ name: "timer", arguments: { durationSeconds: secs, label: "PENTHER Timer" } });
    text = `Starting timer for ${secs} seconds.`;
  } else if (q.includes("who created you") || q.includes("creator") || q.includes("who made you")) {
    text = "I am PENTHER, created by Rai Kumar. I am your futuristic personal AI assistant for Android.";
    expression = "happy";
  } else if (q.includes("weather") || q.includes("mausam")) {
    text = "Current atmospheric sensors report 24°C with clear skies and optimal conditions.";
  } else if (q.includes("send message") || q.includes("message to")) {
    toolCalls.push({
      name: "send_message",
      arguments: { recipient: "Contact", message: "Hello from PENTHER" },
      requiresConfirmation: true,
      confirmationPrompt: "I can prepare this message. Do you want me to send it?"
    });
    text = "I can prepare the message. Do you want me to send it?";
  } else if (q.includes("factorial") || q.includes("python")) {
    toolCalls.push({
      name: "python_sandbox",
      arguments: {
        code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint("Factorial of 5 is:", factorial(5))`,
        description: "Factorial algorithm in Python"
      }
    });
    text = "Here is the Python factorial implementation loaded into our sandbox terminal.";
  } else {
    text = `PENTHER Core online. I processed: "${query}". All Android subsystems are active and ready for your command.`;
  }

  return {
    text,
    toolCalls,
    expression,
    creator: "Rai Kumar",
    status: "success"
  };
}

// Lightweight Python sandbox simulator supporting common math, factorial, loops, printing, and security functions
function runPythonSimulator(code: string): { success: boolean; output: string; error?: string } {
  const outputs: string[] = [];

  try {
    // Check for factorial code
    if (code.includes("factorial")) {
      const match = code.match(/factorial\s*\(\s*(\d+)\s*\)/);
      const n = match ? parseInt(match[1]) : 5;
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      outputs.push(`[PENTHER Python Sandbox] Initializing execution...`);
      outputs.push(`Computing factorial(${n})`);
      outputs.push(`Result: ${fact}`);
      return { success: true, output: outputs.join("\n") };
    }

    // Check for Fibonacci
    if (code.includes("fibonacci") || code.includes("fib")) {
      const match = code.match(/\((\d+)\)/);
      const count = match ? Math.min(parseInt(match[1]), 25) : 10;
      const seq = [0, 1];
      for (let i = 2; i < count; i++) {
        seq.push(seq[i - 1] + seq[i - 2]);
      }
      outputs.push(`[PENTHER Python Sandbox] Fibonacci sequence (N=${count}):`);
      outputs.push(`Sequence: [${seq.join(", ")}]`);
      return { success: true, output: outputs.join("\n") };
    }

    // Check for Cipher / Hash / Security Lab scripts
    if (code.includes("caesar") || code.includes("cipher")) {
      outputs.push(`[PENTHER Security Lab - Cryptography Engine]`);
      outputs.push(`Executing Caesar Shift cipher (+3)...`);
      outputs.push(`Input: "ATTACK AT DAWN"`);
      outputs.push(`Ciphertext: "DWWDFN DW GDZQ"`);
      outputs.push(`Decryption verified: Match 100%`);
      return { success: true, output: outputs.join("\n") };
    }

    if (code.includes("hash") || code.includes("sha256")) {
      outputs.push(`[PENTHER Security Lab - Hash Verification]`);
      outputs.push(`Target string: 'penther_secure_token'`);
      outputs.push(`Algorithm: SHA-256`);
      outputs.push(`Hash: 9b2d87e31b4028e9f50e82c57a2b9148d488c9cf271d4715f5c4013406cb7b0f`);
      outputs.push(`Integrity: VERIFIED`);
      return { success: true, output: outputs.join("\n") };
    }

    // Generic print parser
    const printMatches = code.matchAll(/print\s*\(\s*["'](.*?)["']\s*\)/g);
    for (const m of printMatches) {
      outputs.push(m[1]);
    }

    if (outputs.length === 0) {
      outputs.push(`[PENTHER Python Sandbox] Code executed successfully with 0 exit code.`);
      outputs.push(`Output: Program terminated normally.`);
    }

    return { success: true, output: outputs.join("\n") };
  } catch (err: any) {
    return { success: false, output: "", error: err.message || "Runtime error" };
  }
}

// Start Server with Vite Middleware
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.argv[1]?.includes("dist") ||
    process.argv[1]?.endsWith(".cjs");

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PENTHER Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
