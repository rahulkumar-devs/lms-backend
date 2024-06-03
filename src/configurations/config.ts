import "dotenv/config";

// _config make it private
const _config = {
    port: process.env.PORT || 401,
    client_url: process.env.CLIENT_URL || "",
    activate_token_key: process.env.ACTIVATE_TOKEN_KEY as string || "",
    origin_url:process.env.ORIGIN_URL ||"",

    mongoDB_uri: process.env.MONGODB_URI as string || "",
    env: process.env.NODE_ENV || "",
    redis_uri: process.env.REDIS_URI as string || "",
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY || "",
    cloudinary_api_secret_key: process.env.CLOUDINARY_API_SECRET_KEY || "",
    jwt_secret_key: process.env.JWT_SECRET_KEY as string,

    //    tokens details
    access_token_key: process.env.REFRESH_TOKEN_KEY as string,
    refresh_token_key: process.env.ACCESS_TOKEN_KEY as string,
    access_token_expiry: process.env.REFRESH_TOKEN_EXPIRY as string,
    refresh_token_expiry: process.env.ACCESS_TOKEN_EXPIRY as string,

    // smtp server config
    smtp_user: process.env.SMTP_USER as string,
    smtp_host: process.env.SMTP_HOST as string,
    smtp_password: process.env.SMTP_PASSWORD as string,

    // Admin Emain
    //    admin_email:process.env.ADMIN_EMAIL
};

// freez _config so that noBody can overWrite
 const config = Object.freeze(_config);

 export default config