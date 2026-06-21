import express from "express";
import { addSale, getSales } from "../controller/salesController.js";
import { protect } from "../middleware/authMiddleware.js";



const router = express.Router();


router.post('/add', protect, addSale);
router.get('/', protect, getSales);

export default router;