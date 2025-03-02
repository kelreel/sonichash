import NodeCache from "node-cache";
import * as path from "path";

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL set to 1 minutes

export class SonicService {
    private cache: NodeCache;
    private cacheBaseKey: string = "sonic";

    constructor(private privateKey: string | null, private walletAddress: string | null, private isAgentWallet: boolean) {
        this.cache = cache;
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        // Check in-memory cache first
        const cachedData = this.cache.get<T>(key);
        if (cachedData) {
            return cachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);
    }
}

export const parseWalletFromString = (data: string): string | null => {
    const walletRegex = /0x[a-fA-F0-9]{40}/;
    const match = data.match(walletRegex);
    return match ? match[0] : null;
}