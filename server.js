const express = require('express');
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
	res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.get('/record', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'record.html'));
});

app.post('/saverecord', async (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.status(200).send(req.file.filename);
            // console.log(req.file.filename)
            // console.log(req.body.mouseXY);
            // write mouseXY data as files with filename
            let fn = path.parse(req.file.filename).name;
            filepath = path.join(__dirname, 'public', 'data', 'json', fn +'.json');
            // console.log(filepath);
    		fs.writeFile(filepath, req.body.mouseXY, (err) => {
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

app.get('/getfiles', (req, res) => {
	// count files in blob
	fs.readdir(path.join(__dirname, 'public', 'data', 'audio'), function(err, files) {
		if (err) {
			onError(err);
			return;
		}
		// let nRecords = files.length;
		let blobnames = [];
		files.forEach((f) => blobnames.push(path.parse(f).name));
		let info = {
			'filenames': blobnames
		}
		res.status(200).send(info);
		console.log('GET sent file info');
	})
});

// route for reading and loading audio data from specific blob file
// app.get('/readaudioblobs/:fn', (req, res) => {
// 	const fn = req.params.fn;
// 	fs.readFile(path.join(__dirname, 'public', 'data', 'audio', fn), (err, data) => {
// 		if (err) {
// 			console.error(err);
// 			return;
// 		}
// 		res.send(data);
// 		console.log('GET sent audio blob', fn);
// 	});
// });

app.get('/play', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'play.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);


