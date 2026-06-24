import express from "express";
import { getReturns } from "../controller/returnController.js";
import { protect } from "../middleware/authMiddleware.js";



const router = express.Router();



router.get('/invoice/:invoiceNo',protect, getReturns);



export default router;