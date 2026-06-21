import jwt from "jsonwebtoken";
import pool from "../config/db.js";



const protect=async(req,res,next)=>{

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            token=req.headers.authorization.split(" ")[1];
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            
            const userResult =await pool.query("SELECT id FROM users WHERE id=$1",[
                decoded.id
            ]);

            req.user=userResult.rows[0];

            next();
        }
        catch(error){
            console.log(error);
            res.status(401).json({error:"not authorized"});
        }
    }
    if(!token){
        res.status(401).json({error:"not authorized"});
    }
}

const admin=(req,res,next)=>{

    if(req.user && req.user.role==="ADMIN"){
        next();
    }
    else{
        res.status(401).json({message:"your are not admin"});
    }
}

export {protect,admin};