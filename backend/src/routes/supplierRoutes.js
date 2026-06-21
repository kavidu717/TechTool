import express from "express";
import { addSupplier, getSuppliers } from "../controller/supplierController.js";
import { protect,admin } from "../middleware/authMiddleware.js";



const router = express.Router();

router.post("/add",protect,admin,addSupplier)
router.get("/",protect,getSuppliers)


export default router;