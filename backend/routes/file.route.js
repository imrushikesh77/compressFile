import express from "express";
import upload from "../utils/multer.js"
const router = express.Router();


import {
    encodeFile,
    decodeFile
} from "../controllers/file.controller.js";

router.post("/encode", upload, encodeFile);
router.post("/decode", upload, decodeFile);
router.get("/health", (req, res) => {
    res.json({ message: "Server is running" });
});
router.get("/", (req, res) => {
    res.json({ message: "Welcome to File Encoder/Decoder" });
});

export default router;