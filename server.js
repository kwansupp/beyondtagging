const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, `${__dirname}/public/data/` + req.body.imagename + `/audio`);
	},
	filename: function (req, file, callback) {
		callback(null, file.originalname + '.webm');
	}
});

const upload = multer({storage: storage}).single('audioBlob');


const https = require('https');
const options = {
//  key:fs.readFileSync('/etc/letsencrypt/live/experiments.kwansupp.com/privkey.pem'),
//  cert: fs.readFileSync('/etc/letsencrypt/live/experiments.kwansupp.com/fullchain.pem')
	key:fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt')
};


// middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// functions
var isUnixHiddenPath = function (path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
};

// routing
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
	// res.redirect('/record');
});

app.get('/record', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'record-gallery.html'));
});

app.get('/record/:img', function(req,res) {
	// res.send('img: ' + req.params.img);
	// check if img in img folder
	// fp = path.join(__dirname, 'public', 'img', req.params.img);
	// console.log(fp);
	// console.log(fs.existsSync(fp));

	// make sure data directory exists, else create directory to save file
	let data_dir_path = path.join(__dirname, 'public', 'data', req.params.img);

	if(!fs.existsSync(data_dir_path)) {
		fs.mkdirSync(data_dir_path);
		let audio_path = path.join(__dirname, 'public', 'data', req.params.img, 'audio');
		let json_path = path.join(__dirname, 'public', 'data', req.params.img, 'json');
		fs.mkdirSync(audio_path);
		fs.mkdirSync(json_path);
		console.log('GET /record image item, data directory created');
	}

	// serve record path
	console.log('GET load recording page for image item')
	res.sendFile(path.join(__dirname, 'public', 'views', 'record-item.html'));
});

app.post('/saverecord', async (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.status(200).send(req.file.filename);
            // console.log(req.body.mouseXY);
            // write mouseXY data as files with filename
            let fn = path.parse(req.file.filename).name;
            filepath_json = path.join(__dirname, 'public', 'data', req.body.imagename, 'json', fn +'.json');
            // filepath = path.join(__dirname, 'public', 'data', 'json', fn +'.json');
    		fs.writeFile(filepath_json, req.body.mouseXY, (err) => {
    			if (err) {
    				console.log(err);
    			}
    			else {
    				console.log("file written successfully");
    			}
    		});
    		// move audio file 
    		// filepath_audio = path.join(__dirname, 'public', 'data', req.body.imagename, 'audio', fn)
        }
    })
});

app.get('/getimages', (req, res) => {
	// read directory
	fs.readdir(path.join(__dirname, 'public', 'img'), function(err, files) {
		if (err) {
			onError(err);
			return;
		}
		const imageFiles = files.filter(file => {
			return file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png');
		})
		// let fns = [];
		// files.forEach((f) => fns.push(f));
		// files.forEach((f) => fns.push(path.parse(f).name));
		let info = {
			'filenames': imageFiles
		}
		res.status(200).send(info);
		// res.json(imageFiles);
		console.log('GET sent image paths');
	});
});

app.get('/getrecordedimages', (req, res) => {
	let displayDir = [];
	let imageFiles = [];

	let allDir = fs.readdirSync(path.join(__dirname, 'public', 'data'));
	let allImages = fs.readdirSync(path.join(__dirname, 'public', 'img'));

	allDir.forEach(dir => {
		if(!isUnixHiddenPath(dir)) {
			displayDir.push(dir);
			// find image filename
			fn = allImages.find(fp => fp.includes(dir))
			imageFiles.push(fn);
		}
	})

	let info = {
		'dirnames': displayDir,
		'filenames': imageFiles
	};
	// console.log(info);
	res.status(200).send(info);
	console.log('GET sent recorded images in data');
});

app.get('/getfiles/:img', (req, res) => {

	let audio_path = path.join(__dirname, 'public', 'data', req.params.img, 'audio');
	// count files in blob
	fs.readdir(audio_path, function(err, files) {
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
	res.sendFile(path.join(__dirname, 'public', 'views', 'play-gallery.html'));
});

app.get('/play/:img', (req,res) => {
	res.sendFile(path.join(__dirname, 'public', 'views', 'play-item.html'));
});

// local version - comment out for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// deployment version
// const sslServer=https.createServer(options,app);
// sslServer.listen(3000,()=>{
// console.log('Secure server is listening on port 3000')
// })
