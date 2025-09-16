import express from 'express';
import cors from 'cors';
import connectToDatabase from './database/mongodb.js';
import dns from 'dns';
import { URL } from 'url';

import Url from "./models/url.model.js";

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;

  const dnslookup = dns.lookup(URL.parse(url).hostname, async (error, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      try {
        const urlCount = await Url.countDocuments({});
        const result = await Url.create({ original_url: req.body.url, short_url: urlCount });

        res.json({ original_url: result.original_url, short_url: result.short_url })
      } catch (error) {
        throw error;
      }
    }
  })
})

app.get('/api/shorturl/:shorturlId', async (req, res) => {
  const { shorturlId } = req.params;

  try {
    const url = await Url.findOne({ short_url: shorturlId });

    if (!url) {
      const error = new Error('Url not found');
      error.statusCode = 404;
      throw error;
    }

    res.redirect(url.original_url)
  } catch (error) {
    throw error;
  }
})

app.listen(port, async () => {
  console.log(`Listening on port ${port}`);
  await connectToDatabase();
});
