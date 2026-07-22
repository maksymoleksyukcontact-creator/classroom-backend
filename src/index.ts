import express from "express";
import { subjectsRouter } from "./routes/index.js";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = Number(process.env.BACKEND_PORT ?? 8000);

app.use(express.json());

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
	throw new Error('Frontend url is not defined')
}

app.use(cors({
	origin: frontendUrl,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));


app.use('/api/subjects', subjectsRouter);

app.get("/", (req, res) => {
	res.json({ message: "Hello from Classroom backend!" });
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}/`);
});

