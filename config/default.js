import dotenv from "dotenv";
dotenv.config()

export const exports ={
    port : process.env.PORT,
    mongo : process.env.URL_MONGO,
    secret: process.env.SECRET_KEY
}
