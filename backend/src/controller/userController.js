import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const generateToken=(id,role)=>{
    return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn:"1d"});
}

// register the user

export const regusterUser=async(req,res)=>{
    try{

        const {username,password}=req.body;

        // default it will be a cashier
        const  assignedRole="CASHIER";

        const existUser=await pool.query("SELECT * FROM users WHERE username=$1",[
            username
        ]);

        if(existUser.rows.length>0){
            return res.status(400).json({error:"user already exist"});
        }
        
        //hash the password
        const salt=await bcrypt.genSalt(10);
        const password_hash=await bcrypt.hash(password,salt);

        const newUser=await pool.query("INSERT INTO users(username,password_hash,role) VALUES($1,$2,$3) RETURNING *",[
            username,
            password_hash,
            assignedRole
        ]);

        res.status(201).json({
            message:"user registered successfully",
            user:newUser.rows[0],
        });


        

    }catch(error){
        console.log(error);
        res.status(500).
        json({error:"server error"});
    }
}

export const loginUser=async(req,res)=>{

    try{

        const {username,password}=req.body;

        const user=await pool.query("SELECT * FROM users WHERE username=$1",[
            username
        ]);

        if(user.rows.length===0){
            return res.status(400).json({error:"username or password is incorrect"});
        }
          
        // check the password
        const validPassword=await bcrypt.compare(password,user.rows[0].password_hash);

        if(!validPassword){
            return res.status(400).json({error:"username or password is incorrect"});
        }

         // generate the token
        const token=generateToken(user.rows[0].id,user.rows[0].role);
        
        res.status(200).json({
            message:"user logged in successfully",
            token:token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                role: user.rows[0].role
            }
        })

    }catch(error){
        console.log(error);
        res.status(500).
        json({error:"server error"});
    }
}

