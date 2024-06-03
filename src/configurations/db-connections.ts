import mongoose from "mongoose";
import  config  from "./config";


mongoose.connection.on('connected', () => {
   console.log({status:'Mongoose connected to ',host:  mongoose.connection.host});
});

mongoose.connection.on('error', (err) => {
   console.error('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
   console.log('Mongoose disconnected');
});

const dbConnection = async ()=> {
   try {
      if (!config.mongoDB_uri) {
         throw new Error("MongoDB URI is not defined in the configuration.");
      }

      await mongoose.connect(config.mongoDB_uri, { autoIndex: true });
   } catch (error: any) {
      console.error("Error connecting to the database:", error.message || error);
      process.exit(1);
   }
};

export default dbConnection;


