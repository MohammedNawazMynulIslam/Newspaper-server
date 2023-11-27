const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
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
   const userCollection = client.db("Newspaper").collection("users")


  //jwt
  app.post('/jwt',async(req,res)=>{
    const user = req.body
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn:'23h'
    });
    res.send({token})
  })
// users api
app.get('/users',async(req,res)=>{
  const usersList = await userCollection.find().toArray();
  res.send(usersList)
})
// make admin
app.patch('/users/admin/:id',async(req,res)=>{
  const id = req.params.id
  const filter = {_id:new ObjectId(id)}
  const updatedDoc={
    $set:{
      role:'admin'
    }
  }
  const result = await userCollection.updateOne(filter,updatedDoc)
  res.send(result)
})
app.post('/users',async(req,res)=>{
  const user = req.body
  const query = {email:user.email}
  const exitUser = await userCollection.findOne(query)
  if(exitUser){
    return res.send({message:'user already exist', insertedId:null})
  }
  const result = await userCollection.insertOne(user)
  res.send(result)
})
//    article collec
app.post('/article', async(req,res)=>{
    const article = req.body
    const result = await articleCollection.insertOne(article)
    res.send(result)
})
// aricle by id
app.get('/article/:id',async(req,res)=>{
const id = req.params.id
const result = await articleCollection.findOne({_id:new ObjectId(id)})
res.send(result)
});

// article delete by id
app.delete('/article/:id',async (req,res)=> {
  const id = req.params.id
  const result = await articleCollection.deleteOne({_id: new ObjectId(id)})
  res.send(result)
})
// article update title
app.put("/article/:id", async (req, res) => {
  const id = {_id:new ObjectId(req.params.id)}
  const body = req.body;
  const updateArticle ={
    $set:{
      ...body
    }
  }
const option = {upsert:true}
const result = await articleCollection.updateOne(id,updateArticle,option)
// console.log(body)
res.send(result);

});

// all article
app.get('/article',async(req,res)=>{
  try{
    const {search,publisher,tags}=req.query;

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
// view per article
app.put('/article/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await articleCollection.updateOne(
      { _id:new ObjectId(id) },
      { $inc: { views: 1 } }
    );


    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'View count updated successfully' });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

// trending
app.get('/trending', async (req, res) => {
  try {
    const trendingArticles = await articleCollection
      .aggregate([
        {
          $group: {
            _id: '$_id',
            title: { $first: '$title' },
            views: { $sum: '$views' },
          },
        },
        { $sort: { views: -1 } },
      ])
      .toArray();

    res.json(trendingArticles);
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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