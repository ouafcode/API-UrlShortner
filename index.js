require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient} = require('mongodb');
const dns = require('dns');

const client = new MongoClient(process.env.URL_DB);
const db = client.db("urlShortner");
const urls = db.collection("urls");


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// let urlCounter = 0;
// Your first API endpoint
app.post('/api/shorturl', (req, res) =>{
    const originalUrl = req.body.url;
    const url = new URL(originalUrl)
    const hostname = url.hostname;

    dns.lookup(hostname, async (err, address)=>{
      if (!address){
        return res.json({error: 'invalid url'});
      } else{
        const urlCounter = await urls.countDocuments({});
        const urlDoc= {
          originalUrl,
          short_url:urlCounter
        }
        await urls.insertOne(urlDoc);
        res.json({original_url: originalUrl, short_url: urlCounter})
      }
    })

});

app.get('/api/shorturl/:short_url', async (req, res)=>{
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl});
  res.redirect(urlDoc.originalUrl);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
