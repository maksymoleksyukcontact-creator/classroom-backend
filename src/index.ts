import express from "express";
import { subjectsRouter } from "./routes/index.js";
import cors from "cors";

const app = express();
const PORT = 8000;

app.use(express.json());

app.use(cors({
	origin: process.env.FRONTEND_URL,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
}))

app.use('/api/subjects', subjectsRouter);

app.get("/", (req, res) => {
	res.json({ message: "Hello from Classroom backend!" });
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}/`);
});

