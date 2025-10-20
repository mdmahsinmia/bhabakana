import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:9002",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))

// Rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})

app.use("/api/", limiter)

// Validate API key
if (!process.env.OPENROUTER_API_KEY) {
  console.error("ERROR: OPENROUTER_API_KEY is not set in environment variables")
  process.exit(1)
}

// Store conversations in memory (for production, use a database)
const conversations = new Map()

// Helper function to generate session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15)
}

// POST /api/chat - Handle chat messages
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId, model = "openrouter/auto", temperature = 0.7, maxTokens = 1024 } = req.body

    // Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" })
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" })
    }

    // Get or create conversation
    const id = sessionId || generateSessionId()
    if (!conversations.has(id)) {
      conversations.set(id, [])
    }

    const messages = conversations.get(id)

    // Add user message to history
    messages.push({
      role: "user",
      content: message,
    })

    // Keep only last 20 messages to avoid token limits
    const recentMessages = messages.slice(-20)

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:9002",
        "X-Title": "ChatBot",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful, friendly AI assistant. Provide clear, concise, and accurate responses.",
          },
          ...recentMessages,
        ],
        temperature: Math.min(Math.max(temperature, 0), 2), // Clamp between 0 and 2
        max_tokens: Math.min(maxTokens, 4096), // Cap at 4096
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenRouter API error:", errorData)
      return res.status(response.status).json({
        error: errorData.error?.message || "Failed to get response from AI model",
      })
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    // Add assistant response to history
    messages.push({
      role: "assistant",
      content: assistantMessage,
    })

    res.json({
      sessionId: id,
      message: assistantMessage,
      usage: data.usage,
    })
  } catch (error) {
    console.error("Chat endpoint error:", error)
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// POST /api/chat/stream - Handle streaming responses
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { message, sessionId, model = "openrouter/auto", temperature = 0.7, maxTokens = 1024 } = req.body

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" })
    }

    const id = sessionId || generateSessionId()
    if (!conversations.has(id)) {
      conversations.set(id, [])
    }

    const messages = conversations.get(id)
    messages.push({ role: "user", content: message })

    const recentMessages = messages.slice(-20)

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:9002",
        "X-Title": "ChatBot",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful, friendly AI assistant.",
          },
          ...recentMessages,
        ],
        temperature: Math.min(Math.max(temperature, 0), 2),
        max_tokens: Math.min(maxTokens, 4096),
        stream: true,
      }),
    })

    if (!response.ok) {
      res.write(`data: ${JSON.stringify({ error: "Failed to connect to AI model" })}\n\n`)
      res.end()
      return
    }

    let fullMessage = ""

    // Handle streaming response
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ""
              if (content) {
                fullMessage += content
                res.write(`data: ${JSON.stringify({ content })}\n\n`)
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    // Store the full message in conversation history
    messages.push({ role: "assistant", content: fullMessage })

    res.write(`data: ${JSON.stringify({ done: true, sessionId: id })}\n\n`)
    res.end()
  } catch (error) {
    console.error("Stream endpoint error:", error)
    res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
    res.end()
  }
})

// GET /api/conversations/:sessionId - Retrieve conversation history
app.get("/api/conversations/:sessionId", (req, res) => {
  const { sessionId } = req.params
  const messages = conversations.get(sessionId) || []
  res.json({ sessionId, messages })
})

// DELETE /api/conversations/:sessionId - Clear conversation
app.delete("/api/conversations/:sessionId", (req, res) => {
  const { sessionId } = req.params
  conversations.delete(sessionId)
  res.json({ message: "Conversation cleared" })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`ChatBot server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
