import express from "express";
import { registerUser, loginUser, getUsers, addUser } from "../controller/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";



const router = express.Router();



router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/',protect,admin,getUsers);
router.post('/',protect,admin,addUser);



export default router;