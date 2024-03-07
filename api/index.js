import express from "express"
import cors from "cors"
import mysql2 from "mysql2"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cookieParser from "cookie-parser"

const salt = 10
const app = express();

app.use(express.json())
app.use(cors())
app.use(cookieParser())

const db = mysql2.createConnection({
    host:"localhost",
    user:"root",
    password:"jemini@#123",
    database:"signup"
})

    app.post('/register',(req,res)=>{
        const q="INSERT INTO login (`name`,`email`,`password`) VALUES (?)"
        bcrypt.hash(req.body.password.toString(),salt,(err,hash)=>{
            if(err) return res.json({Error:"Error for hashing password"})
        
            const values = [
                req.body.name,
                req.body.email,
                hash
            ]

            db.query(q,[values],(err,result)=>{
                if(err) return res.json({Error:"inserting error"})
                return res.json({Status:"success"})
            })
        })
        
    })

app.listen(8081,()=>{
    console.log("running")
})