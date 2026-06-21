import express from "express";
import { addProduct, getProducts } from "../controller/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();



router.post('/add', protect, admin, addProduct);
router.get('/', protect, getProducts);


export default router;