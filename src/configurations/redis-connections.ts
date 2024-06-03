import Redis from "ioredis";
import config from "./config";
import createHttpError from "http-errors";

const createRedisClient = () => {
    if (!config.redis_uri) {
        console.error("Redis connection failed: Missing URI");
        throw createHttpError(400, 'Redis Failed to connect: Missing URI');
    }

    return new Redis(config.redis_uri);
};

const redis = createRedisClient();

redis.on("error", (err: any) => {
    if (err.code === "ETIMEDOUT") {
        console.error('Redis connection timed out:', err);
        throw createHttpError(400, 'Redis connection timed out:', err);
    } else if (err.code === "ENOTFOUND") {
        console.error('Redis hostname not found:', err.hostname);
        throw createHttpError(400, `Redis hostname not found: ${err.hostname}`, err);
    } else {
        console.error('Redis error:', err);
        throw createHttpError(400, 'Redis Error', err);
    }
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

process.on('SIGINT', () => {
    redis.quit().then(() => {
        console.log('Redis connection closed through app termination');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    redis.quit().then(() => {
        console.log('Redis connection closed through app termination');
        process.exit(0);
    });
});

export default redis;
