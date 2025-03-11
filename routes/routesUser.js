import express from "express";
import { fetch, createUser, update, deleteUser, getUser } from "../srv/controllers/usercontrollers.js";
import upload from "../middleware/upload.js" // Import the multer configuration

const router = express.Router();

// Use upload middleware before the createimg controller
router.post("/create", upload.single("image"), createUser);
router.get("/fetch", fetch);
router.get("/getUser/:id", getUser);
router.put("/update/:id", upload.single("image"), update);
router.delete("/delete/:id", deleteUser);



export default router;

