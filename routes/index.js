import express from "express";
import { Register, getUsers, login, logout } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.post("/users", Register);
router.post("/login", login);
router.get("/token", refreshToken);
router.delete("/logout", logout);

export default router;
