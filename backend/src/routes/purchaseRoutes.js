import express from "express";
import { addPurchase, getPurchases } from "../controller/purshaseController.js";
import { protect, admin } from "../middleware/authMiddleware.js";



const router = express.Router();

router.post('/add', protect, admin, addPurchase);
router.get('/', protect, admin, getPurchases);



export default router;