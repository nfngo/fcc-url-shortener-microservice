import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

const Url = mongoose.model("Url", urlSchema);

export default Url;