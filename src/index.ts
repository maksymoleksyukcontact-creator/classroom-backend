import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "Hello from Classroom backend!" });
});

const PORT = 8000;

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}/`);
});

