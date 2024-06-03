import Redis from "ioredis"
import config from "./config";




const redisClient = () => {
    if (config.redis_uri) {
        console.log({ status: "redis Connected" })
        return config.redis_uri;
    }
  
    console.error("redis connection failed");
    process.exit(1);

}

const redis = new Redis(redisClient());
export default redis;
