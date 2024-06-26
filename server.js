const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

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

// const https = require('https');
// const options = {
// 	key:fs.readFileSync('server.key'),
// 	cert: fs.readFileSync('server.crt')
// };


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
	// res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
	res.redirect('/record');
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

app.get('/play', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'play.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const sslServer=https.createServer(options,app);
// sslServer.listen(3000,()=>{
// console.log('Secure server is listening on port 3000')
// })
