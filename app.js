const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, `${__dirname}/public/data/audio`);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname + '.webm');
    }
});

const upload = multer({storage: storage}).single('audioBlob');

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);

// middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

app.get('/saverecording')

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
