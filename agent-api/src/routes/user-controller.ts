import { Router } from 'express';
import { generateNonce, SiweMessage, } from 'siwe';
import { authMiddleware } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

const router = Router();

// @ts-ignore
router.use(authMiddleware);

router.get('/agents', async (req, res) => {
    const agents = await prisma.agent.findMany({
        where: {
            userId: req.user.id
        },
    });
    res.send(agents);
});

export default router;