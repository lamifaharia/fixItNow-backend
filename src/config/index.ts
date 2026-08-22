import { configDotenv } from "dotenv";
import { env } from "process";

configDotenv();

const config = {
    NODE_ENV: env.NODE_ENV,
    PORT: Number(env.PORT) || 5000,
    DATABASE_URL: env.DATABASE_URL,
};

export default config;