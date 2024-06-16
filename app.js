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
        callback(null, file.originalname + '.wav');
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

app.post('/saverecording', async (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.status(200).send(req.file.filename);
            // write mouseXY data as files with filename
            let fn = path.parse(req.file.filename).name;
            filepath = path.join(__dirname, 'public', 'data', 'json', fn +'.json');
            // console.log(filepath);
            fs.writeFile(filepath, req.body.mousePos, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("file written successfully");
                }
            });
        }
    })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
