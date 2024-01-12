import mongoose from "mongoose";

export const History = mongoose.model("History", {
    timestamp: Number,
    role: String,
    name: String,
    content: String
});