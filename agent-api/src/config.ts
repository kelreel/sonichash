export const CONFIG = {
    PORT: parseInt(process.env.PORT ?? '3005', 10),
    POSTGRES_URL: process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5444/sonichash?schema=public',
    NODE_ENV: process.env.NODE_ENV ?? 'development',

    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_CUSTOM_DOMAIN: process.env.S3_CUSTOM_DOMAIN,
    S3_REGION: process.env.S3_REGION ?? 'auto',

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ALLORA_API_KEY: process.env.ALLORA_API_KEY,
    SONIC_RPC_URL: process.env.SONIC_RPC_URL ?? 'https://rpc.soniclabs.com',
}