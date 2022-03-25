const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Services
const urlService = require('./services/urlService');

// Determine current environment based on 'CURRENT' environment variable
// CURRENT defaults to dev. Possible values - dev,prod
const current_env = process.env.CURRENT || 'dev';

// Import environment variables from the corresponding environment file
require('dotenv').config({path: "./config/" + current_env + ".env"});

// Basic Configuration
const port = process.env.PORT || 3000;

// MongoDB Configuration
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Home page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener POST
app.post('/api/shorturl', urlService.postUrl);

// URL Shortener GET
app.get('/api/shorturl/:id', urlService.getUrl);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
