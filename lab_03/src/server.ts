import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';
import mongoose from 'mongoose';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Це дозволить Fly.io бачити застосунок


async function startServer() {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Сервер запущено на http://${HOST}:${PORT}`);
    });
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    function gracefulShutdown(signal: string) {
        server.close(async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    }
}

startServer();