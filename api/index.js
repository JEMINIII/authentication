import express from "express"
import cors from "cors"
import mysql2 from "mysql2"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cookieParser from "cookie-parser"

const salt = 10
const app = express();

app.use(express.json())
app.use(cors({
    origin:["http://localhost:3000"],
    methods: ["POST","GET"],
    credentials: true
}))
app.use(cookieParser())

const db = mysql2.createConnection({
    host:"localhost",
    user:"root",
    password:"jemini@#123",
    database:"signup"
})
    const verifyUser = (req,res,next) =>{
        const token = req.cookies.token
        if(!token){
            return res.json({Error:"You are not authenticated"})
        }else{
            jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
                if(err){
                    return res.json({Error:"Token is not ok"})
                }else{
                    req.name = decoded.name
                    next()
                    console.log(req.name)
                }
            })
        }
    }
    

    app.get("/",verifyUser,(req,res)=>{
        return res.json({Status:"success",name:req.name})
    })

    app.post('/register',(req,res)=>{
        const q="INSERT INTO login (`name`,`email`,`password`) VALUES (?)"
    

        var myPlaintextPassword=req.body.password 
        var saltRounds = 10;   
        const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
        // console.log(hash)
        
        const values = [
                req.body.name,
                req.body.email,
                hash
                
            ]
            // console.log(typeof(req.body.password))

            db.query(q,[values],(err,result)=>{
                if(err) return res.json({Error:"inserting error"})
                return res.json({Status:"success"})
                })
            })

    app.post("/login",(req,res)=>{
        const q = "SELECT * FROM login WHERE email = ?";
        db.query(q,[req.body.email],(err,data)=>{
            if(err ) return res.json({Error:"login error"});
            if(data.length>0){
                bcrypt.compare(req.body.password.toString(),data[0].password,(err,response)=>{
                    if(err) return res.json({Error: "password error"})
                    if(response){
                        const name = data[0].name;
                        const token = jwt.sign({name},"jwt-secret-key",{expiresIn:"1d"})//should be env file and 32 char for security purpose
                        // console.log(token)
                        res.cookie('token',token);
                        return res.json({Status:"success"});
                    }else{
                        return res.json({Error:"Password not matched"});
                    }
                })
            }else{
                return res.json({Error:"No email existed"})
            }
            
        })
    })
        
    app.get('/logout',(req,res)=>{
        res.clearCookie('token');
        return res.json({Status:"success"})
    })

app.listen(8081,()=>{
    console.log("running")
})