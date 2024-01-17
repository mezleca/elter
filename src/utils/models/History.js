import mongoose from "mongoose";

export const History = mongoose.model("elterAI", {
    timestamp: Number,
    role: String,
    name: String,
    content: String
});