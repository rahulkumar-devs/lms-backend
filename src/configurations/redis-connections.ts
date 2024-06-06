import Redis from "ioredis";
import config from "./config";
import createHttpError from "http-errors";

// Function to handle Redis errors
const handleRedisError = (err: any) => {
    let errorMessage: string;
    switch (err.code) {
        case "ETIMEDOUT":
            errorMessage = 'Redis connection timed out';
            break;
        case "ENOTFOUND":
            errorMessage = `Redis hostname not found: ${err.hostname}`;
            break;
        default:
            errorMessage = 'Redis error';
    }
    console.error(errorMessage, err);
    return createHttpError(500, errorMessage, { originalError: err });
};

// Function to create Redis client
const createRedisClient = () => {
    if (!config.redis_uri) {
        const errorMessage = "Redis connection failed: Missing URI";
        console.error(errorMessage);
        throw createHttpError(400, errorMessage);
    }

    return new Redis(config.redis_uri);
};

const redis = createRedisClient();

// Redis event listeners
redis.on("error", (err) => {
    handleRedisError(err);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('ready', () => {
    console.log('Redis connection is ready to use');
});

redis.on('end', () => {
    console.log('Redis connection has ended');
});

// Graceful shutdown handling
const gracefulShutdown = () => {
    redis.quit().then(() => {
        console.log('Redis connection closed through app termination');
        process.exit(0);
    }).catch((err) => {
        console.error('Error during Redis shutdown:', err);
        process.exit(1);
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default redis;
