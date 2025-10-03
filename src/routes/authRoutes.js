import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { upload } from "../utils/fileUpload.js";

const router = express.Router();

// Single file upload for profile image during registration

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

export default router;