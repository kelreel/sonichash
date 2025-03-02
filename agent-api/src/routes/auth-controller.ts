import { Router } from 'express';
import { generateNonce, SiweMessage, } from 'siwe';

const router = Router();

router.get('/nonce', function (_, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateNonce());
});

router.post('/verify', async function (req, res) {
    const { message, signature } = req.body;
    const siweMessage = new SiweMessage(message);
    try {
        await siweMessage.verify({ signature });
        res.send(true);
    } catch {
        res.send(false);
    }
});

export default router;