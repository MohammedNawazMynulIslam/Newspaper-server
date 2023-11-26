const express = require('express')
require('dotenv').config()

const app = express()
const cors=require('cors')
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7jyxnen.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
app.use(cors())
app.use(express.json())
// routes




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
    // await client.connect();
   const articleCollection = client.db("Newspaper").collection("article")

//    article collec
app.post('/article', async(req,res)=>{
    const article = req.body
    const result = await articleCollection.insertOne(article)
    res.send(result)
})

app.get('/article/:id',async(req,res)=>{
const id = req.params.id
const result = await articleCollection.findOne({_id:new ObjectId(id)})
res.send(result)
});

app.get('/article',async(req,res)=>{
  try{
    const {search,publisher,tags}=req.query;
    // console.log('Search:', search);
    // console.log('Publisher:', publisher);
    // console.log('Tags:', tags);
    let filter = {};
    if (search) {
      filter.title = { $regex: new RegExp(search, 'i') };
    }
    if (publisher) {
      filter.publisher = publisher;
    }
    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    // console.log('Filter:', filter);
    const result = await articleCollection.find().toArray();
    // console.log("mongodb query",result);
    res.send(result);
}catch(error){
  console.error("error fetching",error);
  res.status(500).json({error:"internal server error"})
}
})

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Newspaper')
})

app.listen(port, () => {
  console.log(`Newspaper listening on port ${port}`)
})