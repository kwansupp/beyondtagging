console.log("script.js loaded");
console.log(window.location.pathname);

// (function (app, $, undefined) {

//     $(document).ready(function () {
//         console.log('document ready');
        
//         // $("#btnRestore").on("click", app.onButtonRestoreClick);
//         app.canvas = document.getElementById("canvas");
//         ctx = app.canvas.getContext("2d");
//         app.setCanvas();
//         app.createLineSettings();

//         if(window.location.pathname == "/play") {
//         	console.log("recordingState", app.recordingState);
//         	$("#canvas").on("click", app.redraw);
//         } else {
// 	        $("#canvas").on("mousemove", app.draw);
//         }
//         $("#saveBtn").on("click", app.saveRecording);
//         $("#replayBtn").on("click", app.redraw);
//     });

//     // data model for points to draw
//     app.model = {
//         point: {
//             x: 0,
//             y: 0
//         }
//     };

//     // set global variables
//    	let ctx;
//    	let pt = Object.create(app.model.point);
//    	// let startPt;
//    	// let endPt;

//     app.buffer = [];
//     app.audioBuffer = [];
//     app.recordingState = false;

//     // function to update position of cursor
//     app.getPosition = function (e) {
//     	// let pt = Object.create(app.model.point);
    	
//     	pt.x = e.clientX - app.canvas.offsetLeft;
//     	pt.y = e.clientY - app.canvas.offsetTop;
//     	let savePt = Object.create(app.model.point);
//     	savePt.x = pt.x;
//     	savePt.y = pt.y
//     	// save position to buffer
//     	app.buffer.push(savePt);
//     	console.log("getPosition", pt);
//     	return pt;
//     };
    
//     app.draw = function (e) {
//     	// set recording state to be true
//     	app.recordingState = true;
//     	$("#recordingStatus").show();
//     	// app.startAudioRecording();

//     	app.createLineSettings();
//     	// draw lines on canvas
//     	ctx.beginPath();
//     	ctx.moveTo(pt.x, pt.y);
//     	app.getPosition(e);
//     	ctx.lineTo(pt.x, pt.y);
//     	ctx.stroke();
//     };


//     app.createLineSettings = function() {
//     	// set line format
// 	    ctx.lineWidth = 5;
//     	ctx.lineCap = "round";
//     	if (app.recordingState) {
//     		ctx.strokeStyle = "red";
//     	} else {
//     		// random color
// 	    	let r = Math.floor(Math.random() * 256);
// 	    	let g = Math.floor(Math.random() * 256);
// 	    	let b = Math.floor(Math.random() * 256);
//     		ctx.strokeStyle = "rgb("+r+","+g+","+b+")";
//     	}
//     };

//     app.saveRecording = function() {
//     	app.recordingState = false;
//     	$("#recordingStatus").hide();
//     	console.log(app.buffer);
//     	// write arrays to files
    	
//     	let formData = new FormData();

// 		// // formData.append('blob_fn', filename);
// 		// // formData.append('audioBlob', audioBlob, filename);
// 		formData.append('ptBuffer', [app.buffer]);
		
// 		console.log("saveRecording data: ", formData);



// 		// fetch('/saverecord', {
// 		// 	method: 'POST',
// 		// 	body: formData
// 		// })
// 		// .then(response => response.text())
// 		// .then(data => {
// 		// 	console.log("Sent: ", data); // handle success response
// 		// 	// redirect
// 		// 	window.location.href = '/';
// 		// })
// 		// .catch(error => {
// 		// 	console.error('Error:', error); // handle error
// 		// });

// 		// redirect to /play route
//     };

//     app.onButtonClearClick = function (ctrl) {
//         app.setCanvas();
//         app.buffer = [];
//     };

//     app.onButtonRestoreClick = function (ctrl) {
//         var i = 0,
//             pt = null,
//             delay = 1000;

//         app.setCanvas();
//         if (app.buffer.length > 0) {
//             for (i; i < app.buffer.length; i++) {
//                 pt = app.buffer[i];
//                 app.drawRect(pt, delay);
//                 delay = delay + 50;
//             }
//         }
//     };

//     app.redraw = function (ctrl) {
//     	app.setCanvas();

//     	// load data
//     	let data = app.buffer;
//     	console.log("data", data);

//     	let delay = 1000;
//     	pt = null;

//     	app.createLineSettings();
//     	for (let i = 0; i < data.length - 1; i++) {
//     		pt = data[i];
//     		// setTimeout('app.canvas.getContext("2d").', delay)
// 	    	// draw lines on canvas
// 	    	ctx.beginPath();
// 	    	ctx.lineWidth = 5;
//     		ctx.lineCap = "round";
//     		ctx.strokeStyle = "blue";
// 	    	ctx.moveTo(data[i].x, data[i].y);
// 	    	ctx.lineTo(data[i+1].x, data[i+1].y);
// 	    	ctx.stroke();

//     		delay = delay +50;
//     	}
//     }

//     app.setCanvas = function () {
//         // start with clean slate
//         // ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
// 		const img = new Image();
// 		img.src = '/img/plane-glacier.jpg';
// 	    img.onload = function() {
// 	    	app.canvas.width = this.naturalWidth;
// 	  		app.canvas.height = this.naturalHeight;
// 	        ctx.drawImage(this, 0, 0);
// 	    };
//     };

// })(window.app = window.app || {}, jQuery)

//keeps track of time
let timer = 0;

//this saves the mouse position
let pvmx = 0;
let pvmy = 0;
let mousePos = {
	"x": [],
	"y": []
};

//this sets up the mic
let mic, recorder, soundFile;
let state = 0;

//this tracks if we started the recording of mouse movmt
let recmouse = 0;

// creates button item
let cnv;

function preload(){
img = loadImage('/img/plane-glacier.jpg'); // Load the image

}

function setup() {
  var canvas = createCanvas(800, 500, SVG);
  canvas.parent("image-container");
  background(img);
  
  //create button
  cnv = createButton('Start recording.');
  cnv.parent("status-container");
  cnv.mousePressed(audioRec);

  // create an audio in
  mic = new p5.AudioIn();

  // prompts user to enable their browser mic
  mic.start();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // this sound file will be used to
  // playback & save the recording
  soundFile = new p5.SoundFile();
  
}


function draw() {
  strokeWeight(5);
  stroke(255, 204, 0);

   if (millis() >= 100+timer && recmouse == 1) {
    line(pvmx, pvmy, mouseX, mouseY);
    timer = millis();
    pvmx = mouseX;
    pvmy = mouseY;
    // log pvpmx, pvmy
    mousePos.x.push(pvmx);
    mousePos.y.push(pvmy)
  }
}


function audioRec() {
  // ensure audio is enabled
  userStartAudio();

  // make sure user enabled the mic
  if (state === 0 && mic.enabled) {

    // record to our p5.SoundFile
    recorder.record(soundFile);

    cnv.html("Stop recording."); // Change the button's HTML content
    $("#status-text").text("Your voice and mouse are being recorded.")
    
    state++;
    recmouse++;
    
    //this starts the mouse at the right position
    
    pvmx = mouseX;
    pvmy = mouseY;
  }
  else if (state === 1) {

    // stop recorder and
    // send result to soundFile
    recorder.stop();
    
    cnv.html("Submit recording."); // Change the button's HTML content
    $("#status-text").text("Your recording is completed, please submit your recording to be saved! If you wish to redo your recording, refresh this page.")

    state++;
    recmouse++;
  }

  else if (state === 2) {
  	// SEND DATA TO SAVE
  	// console.log(soundFile);
  	// get blob of sound file
  	let audioBlob = soundFile.getBlob();
  	console.log(audioBlob);
  	console.log(mousePos);

  	saveRecording("test", audioBlob, mousePos);


    // save(soundFile, 'mySound.wav');
    state++;
    // save('mySVG.svg');
    
    // cnv.html("All done, please send it to us!."); // Change the button's HTML content
    // redirect to view all recordings
  }
}

function saveRecording(filename, audioBlob, mousePos) {
	let formData = new FormData();

	formData.append('audioBlob', audioBlob, filename);
	formData.append('mousePos', mousePos);

	console.log("saveRecording data:", formData);

	fetch('/saverecording', {
		method: 'POST',
		body: formData
	})
	.then(response =>response.text())
	.then(data => {
		console.log("Sent: ", data); // handle success response
		// redirect

	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

