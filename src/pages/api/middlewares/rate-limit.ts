import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const rateLimitMap = new Map();

export default function rateLimitMiddleware(handler: NextApiHandler, limit = 6) {
    return (req: NextApiRequest, res: NextApiResponse) => {
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const windowMs = 60 * 1000; // 1 minute
        
        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, {
                count: 0,
                lastReset: Date.now(),
            });
        }
        
        const ipData = rateLimitMap.get(ip);
        
        if (Date.now() - ipData.lastReset > windowMs) {
            ipData.count = 0;
            ipData.lastReset = Date.now();
        }
        
        if (ipData.count >= limit) {
            return res.status(429).send({error: "Too Many Requests"});
        }
        
        ipData.count += 1;
        
        return handler(req, res);
    };
}