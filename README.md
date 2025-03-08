# SonicHash

A modern AI-agent platform built with Next.js that combines blockchain technology with a powerful tech stack for a seamless user experience.

## 🚀 Features

- Web3 Integration with RainbowKit and Wagmi
- Next.js 15 with App Router
- Chakra UI for beautiful, responsive design
- Prisma for database management
- OpenAI integration
- AWS S3 integration
- Authentication withSIWE
- TypeScript support
- API routes with Express

## 🛠 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- A Web3 wallet (like MetaMask)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sonichash.git
cd sonichash
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .example.env .env
```
Edit `.env` with your configuration.

4. Generate Prisma client:
```bash
npx prisma generate
```

## 🚀 Development

Run the development server:

```bash
npm run dev
```

For the API server:
```bash
npm run dev:api
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🏗 Project Structure

- `/src` - Main application code
- `/prisma` - Database schema and migrations
- `/agent-api` - API server code
- `/public` - Static assets

## 🔧 Technologies

- [Next.js](https://nextjs.org/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [Chakra UI](https://chakra-ui.com/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI](https://openai.com/)
- [AWS S3](https://aws.amazon.com/s3/)

## 📄 License

This project is licensed under the MIT License.
