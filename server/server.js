import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import "./serialReader.js";
import { getLastEvent } from './state.js';


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.get('/attendance', async (req, res) => {
    try {
        const Attendance = (await import('./models/Attendance.js')).Attendance;
        const records = await Attendance.find().sort({ timestamp: -1 });
        res.json(records);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/last-event', (req, res) => {
    const evt = getLastEvent();
    res.json(evt || null);
});


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error.message);
});