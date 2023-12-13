const express = require("express")
const app = express()
require('dotenv').config()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const cors = require("cors")
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(express.json())
// app.use(cors({
//   origin : ["http://localhost:5173"],
//   credentials : true
// }))

app.use(cors({
  origin : ["http://localhost:5173"],
  credentials : true
}))
app.use(cookieParser())

// middleware
// const logger = (req,res, next) => {
//   console.log("log info",req.method, req.url)
//   next()
// }

// const verifyToken = (req, res, next) => {
//   const token = req.cookies?.token
//   console.log("Token in middleware", token)
//   if(!token){
//     res.status(401).send({message : "unauthorized access"})
//   }

//   jwt.verify(token, process.env.DB_ACCESS_SECRET_TOKEN, (err, decoded) => {
//     if(err){
//       res.status(401).send({message : "unauthorized access"})
//     }
//     req.user = decoded
//     next()
//   } )
  
// }




// verify token middleware

const verifyToken = async(req,res, next) => {
  const token = req.cookies.token
  if(!token){
    res.status(401).send({message : "unauthorized"})
  }

  jwt.verify(token, process.env.DB_ACCESS_SECRET_TOKEN, (err, decoded) => {
    if(err){
      res.status(401).send({error : "not authorized"})
    }
    
    req.user = decoded
    next()
  })
}



// hrsafin2434
// ZGvfKOANl7ytiHor

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2nzyowf.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // events
    const database = client.db("event-service");
    const eventCollection = database.collection("services");


    // auth related ui
    //  app.post("/jwt", async(req, res) =>{
    //    const user = req.body
    //    console.log(user)
    //   //  generate token
    //    const token = jwt.sign(user, process.env.DB_ACCESS_SECRET_TOKEN, {expiresIn : "3hr"})


    //    res
    //    .cookie("token", token, {
    //     httpOnly : true,
    //     secure : true,
    //     sameSite : "none"
    //    })
    //    .send({success : true})

    //  })
     
    //  app.post("/logout", async(req, res) => {
    //     const user = req.body
    //     console.log("Logget out", user)
    //     res.clearCookie("token", {maxAge : 0}).send({success : true})
    //  })
    // upcoming events

    // app.post("/logout", async(req, res) => {
    //   const user = req.body
    //   console.log("logged out", user  )
    //   res.clearCookie("token", {maxAge : 0}).send({success : true})
    // })

    const database2 = client.db("new-event");
    const newEventCollection = database2.collection("events")

    // purchase list
    const database3 = client.db("cartsDB")
    const cartCollection  = database3.collection("carts")


    // server related api
    app.get("/events", async(req, res) => {
        const filter = req.query
        
        const query = {
          // price : {$lte : 200}
        }
        console.log(query)

        const options = {
          sort : {
            event_price : filter.sort === "asen" ? 1 : -1
          }
        }
        const cursor = eventCollection.find(query, options)
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get("/newEvents", async(req,res) => {
      const cursor = newEventCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/events/:title", async(req, res) => {
        // const id = req.params.id
        const event = req.body
        const query = { title : event.title}
        const result = await eventCollection.findOne(query)
        res.send(result)
    })


    // cart related

    app.post("/cart", async(req,res) => {
      const cart = req.body
      const result = await cartCollection.insertOne(cart)
      res.send(result)
      console.log(result)
    })

    // app.get("/cart", logger, verifyToken, async(req,res) => {
    //   // login owner
    //   console.log(req.query.email)
    //   console.log("cook cook", req.cookies)
    //   // token owner
    //   console.log("token owner", req.user.email)

    //   if(req.user.email !== req.query.email){
    //     res.status(403).send({message : "not authorized"})
    //   }
    //   let query = {}
    //   if(req.query?.email){
    //     query = {email : req.query.email}
    //   }

    //   const result = await cartCollection.find(query).toArray()
    //   res.send(result)
    // })

    

    // auth related practice

    // generate token

    app.post("/jwt", async(req, res) => {
      const user = req.body
      // generating token 
      const token = jwt.sign(user, process.env.DB_ACCESS_SECRET_TOKEN, {expiresIn : "3hr"})
      res
      .cookie("token", token, {
        httpOnly : true,
        sameSite : "none",
        secure : true
      })
      .send({success : true})
      console.log("server token", token)
    })

    app.get("/cart", verifyToken, async(req,res) => {

      // console.log("token user", req.user.email)
      // console.log("user valid user", req.query.email)
      
      if(req.user.email !== req.query.email){
        res.status(403).send({message : "Forbidden access"})
      }
      let query = {}
      if(req.query?.email){
        query = {email : req.query?.email}
      }

      const result = await cartCollection.find(query).toArray()
      res.send(result)
      console.log(query)
    })

    // remove token when user is logged out

    app.post("/logout", async(req, res) => {
      
      const user = req.body
      res.clearCookie("token", {maxAge : 0}).send({success : true})
    })

    
    app.delete("/cart/:id", async(req, res) => {
      const id = req.params.id
      console.log(id)
      const query = {_id : new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    // app.get("/cart", async(req,res) => {
    //   const user = req.body
    //   const query = {email : user.email }
    //   const result = await cartCollection.find(query).toArray()
    //   res.send(result)
    // })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get("/", (req, res) => {
    res.send("Event Academia is running")
})


app.listen(port, ()=> {
    console.log(`server is running at http://localhost:${port}`)
})