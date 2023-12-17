const express = require('express');
const redis = require('redis');
const util = require('util');
const axios = require('axios');
const client = redis.createClient({
  host: '16.171.159.153',
  port: 6379,
});
client.set = util.promisify(client.set);
client.get = util.promisify(client.get);
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
  const { key, value } = req.body;
  const response = await client.set(key, value);
  res.json(response);
});

app.get('/', async (req, res) => {
  const { key } = req.body;
  const response = await client.get(key);
  res.json(response);
});

app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const cachedPost = await client.get(`post-${id}`);
  if (cachedPost) {
    return res.json(JSON.parse(cachedPost));
  }
  const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  client.set(`post-${id}`, JSON.stringify(response.data), 'EX', 3600);
  return res.json(response);
});

app.listen(8080, () => {
  console.log('Hey, now listening on port :8080');
});

// Testing the ssh configuration
