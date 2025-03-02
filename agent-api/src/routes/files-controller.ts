import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

const router = Router();

// @ts-ignore - Ignore TypeScript errors for this route handler
router.post('/', async (req: Request, res: Response) => {
    try {
        // Parse the multipart form data
        const form = formidable({
            maxFileSize: 1024 * 1024 * 5, // 5MB
            maxFiles: 1,
            keepExtensions: true
        });
        
        const [fields, files] = await form.parse(req);

        if (!files.file?.[0]) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = files.file[0];
        
        // Read file content as Buffer
        const fileContent = fs.readFileSync(file.filepath);
        
        // Configure S3 client
        const s3Client = new S3Client({
            region: process.env.S3_REGION || 'auto',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            forcePathStyle: true
        });

        // Generate a unique filename with proper extension
        const originalExt = path.extname(file.originalFilename || '');
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${originalExt}`;
        
        try {
            // Upload to S3
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME || '',
                Key: `uploads/${fileName}`,
                Body: fileContent,
                ContentType: file.mimetype || 'application/octet-stream',
            });
    
            await s3Client.send(command);
            
            // Clean up the temporary file
            fs.unlinkSync(file.filepath);
            
            // Return success with file URL
            const fileUrl = process.env.S3_CUSTOM_DOMAIN 
                ? `${process.env.S3_CUSTOM_DOMAIN}/uploads/${fileName}`
                : `uploads/${fileName}`;
                
            return res.status(200).json({ 
                success: true,
                url: fileUrl,
                fileName: fileName,
                fileSize: file.size,
                mimeType: file.mimetype
            });
        } catch (uploadError) {
            console.error('S3 Upload Error:', uploadError);
            
            // Try alternative upload approach if first one fails
            const alternativeCommand = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME || '',
                Key: `uploads/${fileName}`,
                Body: fs.createReadStream(file.filepath),
                ContentType: file.mimetype || 'application/octet-stream',
            });
            
            await s3Client.send(alternativeCommand);
            
            // Clean up the temporary file
            fs.unlinkSync(file.filepath);
            
            // Return success with file URL
            const fileUrl = process.env.S3_CUSTOM_DOMAIN 
                ? `${process.env.S3_CUSTOM_DOMAIN}/uploads/${fileName}`
                : `uploads/${fileName}`;
                
            return res.status(200).json({ 
                success: true,
                url: fileUrl,
                fileName: fileName,
                fileSize: file.size,
                mimeType: file.mimetype
            });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ 
            error: 'Error uploading file', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

export default router;