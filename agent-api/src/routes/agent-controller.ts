import { Router } from "express";
import { prisma } from "../prisma";

import { z } from "zod";
import { authMiddleware } from "../middlewares/authMiddleware";

import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources/chat/completions.mjs";
import { Prisma } from "@prisma/client";
import { SonicService } from "../services/SonicService";
import { ChatService, InputMessage } from "../services/ChatService";

const router = Router();

const tgBotSettingsSchema = z.object({
  enabled: z.boolean(),
  token: z.string().optional(),
})

const twitterClientSettingsSchema = z.object({
  enabled: z.boolean(),
  username: z.string().optional(),
  password: z.string().optional(),
  email: z.string().optional(),
  secret2fa: z.string().optional(),
  targetUsers: z.array(z.string()).optional(),
});

// Add this shared schema near the top with other schemas
const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ticker: z.string().optional(),
  imgUrl: z.string().optional(),
  mode: z.enum(['PUBLIC', 'PRIVATE']),
  bio: z.string().max(1600).optional(),
  lore: z.string().max(1600).optional(), 
  knowledge: z.string().max(1600).optional(),
  walletAddress: z.string().optional(),
  messageExamples: z.array(z.string()),
  postExamples: z.array(z.string()),
  twitterUrl: z.string().optional(),
  telegramUrl: z.string().optional(),
  siteUrl: z.string().optional(),
  systemPrompt: z.string().max(1600).optional(),
  providePriceData: z.boolean().optional(),
  providePortfolioData: z.boolean().optional(),
  tgBotSettings: tgBotSettingsSchema.optional(),
  twitterClientSettings: twitterClientSettingsSchema.optional(),
});

// GET PUBLIC AGENTS LIST
router.get("/", async (req, res) => {
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ticker: true,
        imgUrl: true,
        mode: true,
        telegramUrl: true,
        twitterUrl: true,
        siteUrl: true,
        createdAt: true,
        walletAddress: true,
      },
      take: 100,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        mode: "PUBLIC"
      }
    });

    let portfolios = {};
    await Promise.allSettled(agents.filter(agent => agent.walletAddress).map(async (agent) => {

    }));

    res.json({ agents, portfolios });
});

const agentPublicFields: Prisma.AgentSelect = {
  id: true,
  name: true,
  description: true,
  ticker: true,
  imgUrl: true,
  mode: true,
  createdAt: true,
  walletAddress: true,
  twitterUrl: true,
  telegramUrl: true,
  siteUrl: true,
  user: {
    select: {
      id: true,
      name: true,
      walletAddress: true,
    }
  }
}

// GET USER AGENTS LIST (PUBLIC & PRIVATE)
// @ts-ignore
router.get("/private", authMiddleware(true), async (req, res) => {
  const agents = await prisma.agent.findMany({
    select: agentPublicFields,
    take: 100,
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      userId: req.user!.id
    }
  });
  res.json({ agents });
});

// CREATE AN AGENT
// @ts-ignore
router.post("/", authMiddleware(true), async (req, res) => {
    const createAgentSchema = agentSchema;

  try {
    const data = createAgentSchema.parse(req.body);

    const user = await prisma.user.findFirstOrThrow({
      where: {
        walletAddress: req.user!.walletAddress
      },
      select: {
        _count: {
          select: {
            agents: true
          }
        }
      }
    });

    if (user._count.agents >= 3) {
      return res.status(400).json({ error: `You have reached the maximum number of agents (${user._count.agents}/3)` });
    }
    
    const agent = await prisma.agent.create({
      data: {
        ...data,
        userId: req.user!.id,
        modelProvider: "OpenAI",
        clients: ["direct"],
      }
    });

    res.status(201).json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// PATCH AN AGENT
// @ts-ignore 
router.patch("/:id", authMiddleware(true), async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  if (agent.userId !== req.user!.id) {
    return res.status(403).json({ error: "You are not authorized to update this agent" });
  }

  const updateAgentSchema = agentSchema.partial();

  try {
    const data = updateAgentSchema.parse(req.body);
    
    const updatedAgent = await prisma.agent.update({
      where: {
        id: req.params.id
      },
      data
    });

    res.json(updatedAgent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});


// @ts-ignore
router.get("/:id", authMiddleware(false), async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id: req.params.id
    },
    select: agentPublicFields,
  });

  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  if (agent?.mode === "PRIVATE") {
    if (agent.userId !== req.user?.id) {
      return res.status(403).json({ error: "You are not authorized to access this private agent" });
    }
  }

  let state = '';

  res.json({...agent, state});
});

// @ts-ignore
router.get("/:id/full", authMiddleware(true), async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id: req.params.id
    },
  });

  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  if (agent?.mode === "PRIVATE") {
    if (agent.userId !== req.user?.id) {
      return res.status(403).json({ error: "You are not authorized to access this private agent" });
    }
  }

  let state: null;

  res.json({...agent});
});

// DELETE AN AGENT
// @ts-ignore 
router.delete("/:id", authMiddleware(true), async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to delete this agent" });
    }

    await prisma.agent.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CHAT with an agent
// @ts-ignore
router.post("/:id/chat", authMiddleware(false), async (req, res) => {
  const chatService = new ChatService();

  try {
    const {message, previousMessages = []} = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (previousMessages.length > 20) {
      return res.status(400).json({ error: "Maximum of 20 previous messages allowed" });
    }

    const agent = await prisma.agent.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Validate access
    const hasAccess = await chatService.validateAccess(agent, req.user as any);
    if (!hasAccess) {
      return res.status(403).json({ error: "You are not authorized to chat with this agent" });
    }

    // Generate response
    const response = await chatService.generateResponse(
      agent,
      message,
      req.body.previousMessages
    );

    res.json(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

export default router;
