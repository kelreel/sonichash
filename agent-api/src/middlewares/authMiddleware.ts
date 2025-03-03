import { Request, Response, NextFunction } from 'express';
import { SiweMessage } from 'siwe';
import { prisma } from '../prisma';

export type AuthUser = {
  id: string;
  walletAddress: string;
  chainId: number;
}

export const authMiddleware = (required: boolean = true) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authMessage = req.headers['x-auth-message'] as string;
      const authSignature = req.headers['x-auth-signature'] as string;


      if (required && (!authMessage || !authSignature)) {
        return res.status(401).json({ error: 'Missing authentication' });
      }

      const siweMessage = new SiweMessage(atob(authMessage));
      const verified = await siweMessage.verify({ signature: authSignature });

      if (required && !verified) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      if (!required && !verified) {
        req.user = null;
        return next();
      }

      let user = await prisma.user.findUnique({
        where: {
          walletAddress: siweMessage.address.toLowerCase()
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: siweMessage.address.toLowerCase(),
          }
        });
      }

      req.user = {
        id: user.id,
        walletAddress: siweMessage.address.toLowerCase(),
        chainId: siweMessage.chainId
      };

      next();
    } catch (error) {
      if (!required) {
        req.user = null;
        return next();
      }

      return res.status(401).json({ error: 'Invalid auth' });
    }
  }
};

// Extend Express Request type to include our user property
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        walletAddress: string;
        chainId: number;
      } | null;
    }
  }
}
