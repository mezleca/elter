import mongoose from "mongoose";

export const History = mongoose.model("elterAI", {
    timestamp: Number,
    date: String,
    role: String,
    name: String,
    content: String
});
