import app from "./src/app";
import config from "./src/configurations/config"

import dbConnection from "./src/configurations/db-connections"

// direct import 
import "./src/configurations/redis-connections"
import "./src/configurations/cloudinary-connections"


const server = app.listen(config.port, async () => {
await  dbConnection()
    console.log({ state: "Server is Running...", port: config.port })
})

const gracefulShutdown = () => {
   
    server.close(() => {
        console.log('Process terminated');
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
