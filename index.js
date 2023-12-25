const express = require("express")
const app = express()
require('dotenv').config()
const cors = require("cors")
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(express.json())

app.use(cors())






// verify token middleware




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
    const database2 = client.db("new-event");
    const newEventCollection = database2.collection("events")

    // purchase list
    const database3 = client.db("cartsDB")
    const cartCollection  = database3.collection("carts")


    // server related api
    

    app.get("/newEvents", async(req,res) => {
      const cursor = newEventCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/events/:id", async(req, res) => {
        const id = req.params.id
        const query = { _id : new ObjectId(id)}
        const result = await eventCollection.findOne(query)
        res.send(result)
    })
    app.get("/events", async(req, res) => {
        const result = await eventCollection.find().toArray()
        res.send(result)
    })


    // cart related

    app.post("/cart", async(req,res) => {
      const cart = req.body
      const result = await cartCollection.insertOne(cart)
      res.send(result)
      console.log(result)
    })

    app.delete("/cart/:id", async(req, res) => {
      const id = req.params.id
      console.log(id)
      const query = {_id : new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    app.get("/cart/:email", async(req,res) => {
      const email = req.params.email
      const query = {email : email }
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })


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