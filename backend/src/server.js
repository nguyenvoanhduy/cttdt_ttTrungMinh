import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB đã kết nối thành công"))
    .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("Hello from backend!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
