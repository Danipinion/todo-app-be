import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

try {
	await db.authenticate();
	console.log("database connection....");
} catch (error) {
	console.error(error);
}

app.use(cors({ credentials: true, origin: "*" }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
