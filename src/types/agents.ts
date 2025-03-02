import { Prisma } from "@prisma/client";

export type AgentPublicBrief = {
    id: string;
    name: string;
    description: string;
    ticker: string;
    imgUrl: string;
    mode: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        walletAddress: string;
    }
    walletAddress: string;
    twitterUrl: string;
    telegramUrl: string;
    siteUrl: string;
}

export type AgentFull = Prisma.AgentGetPayload<{ include: { user: true } }>;

export type TelegramClientSettings = {
    enabled: boolean;
    token: string;
}

export type TwitterClientSettings = {
    enabled: boolean;
    username: string;
    password: string;
    email: string;
    secret2fa: string;
    targetUsers: string[];
}