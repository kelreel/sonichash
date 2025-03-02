import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';

const router = Router();

// @ts-ignore
router.post('/', async (req, res) => {
    try {
        // Parse the multipart form data
        const form = formidable(
            {
                maxFileSize: 1024 * 1024 * 5, // 5MB
                maxFiles: 1
            }
        );
        const [fields, files] = await form.parse(req);

        if (!files.file?.[0]) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = files.file[0];

        // Configure S3 client
        const s3Client = new S3Client({
            region: 'auto',
            endpoint: process.env.S3_ENDPOINT!,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
            },
            forcePathStyle: true // Required for non-AWS S3 providers
        });

        // Generate unique filename
        const fileExtension = file.originalFilename.split('.').pop();
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: uniqueFilename,
            Body: require('fs').createReadStream(file.filepath),
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Return the file URL using custom domain
        const fileUrl = `${process.env.S3_CUSTOM_DOMAIN}/${uniqueFilename}`;
        
        res.json({ url: fileUrl });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }

});

export default router;