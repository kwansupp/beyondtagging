console.log("record.js loaded");

// RECORD ///////////////
// when document ready for recording
document.addEventListener("DOMContentLoaded", function() {

	// set up audio recording
	const constraints = {
	  audio: true,
	  video: false
	};

	navigator.mediaDevices.getUserMedia(
	  constraints
	).then(
	  successCallback,
	  errorCallback
	);

	function successCallback(stream) {
	  console.log('getUserMedia() got stream: ', stream);
	  window.stream = stream;
	}

	function errorCallback(error) {
	  console.log('navigator.getUserMedia error: ', error);
	}


	// setup canvas
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	ctx.canvas.width = window.innerWidth; 
  	ctx.canvas.height = window.innerHeight;

  	// drawing settings
  	ctx.strokeStyle = "red";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

	// load background image
	const img = new Image();
	img.src = '/img/plane-glacier.jpg';
    img.onload = function() {
    	canvas.width = this.naturalWidth;
  		canvas.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);
    };

	// variables for tracking mouse position
	// let mouseXY = [];
	let mouseXY = []; // log coord.x, coord.y, elapsedTime
	let coord = {x:0, y:0};
	// let coord;
	let drawingEnabled = false;
	// console.log(mouseX, mouseY);

	// Event listeners for mouse movements
	canvas.addEventListener("mousemove", draw);

    // function for mouse position
    function reposition(e) {
    	coord.x = e.clientX - canvas.offsetLeft;
    	coord.y = e.clientY - canvas.offsetTop;
    	// console.log(coord.x, coord.y);
    }

    function draw(e) {
    	// only draw if drawing is enabled
    	if(drawingEnabled) {
    		// log mouse position
    		// console.log(coord);
    		mouseXY.push([elapsedTime, coord.x, coord.y]);
    		ctx.beginPath();
	    	ctx.lineWidth = 5;
	    	ctx.lineCap = "round";
	    	ctx.strokeStyle = "red";
	    	ctx.moveTo(coord.x, coord.y);
	    	reposition(e);
	    	ctx.lineTo(coord.x, coord.y);
	    	ctx.stroke();
    	}
    	
    }

	let recordingState = false;

	/////////////////////////////
	// TIMER FUNCTIONS
	let timerInterval;
	let elapsedTime = 0;

	function startTimer() {
		console.log("timer started.")
		const startTime = Date.now() - elapsedTime;

	    timerInterval = setInterval(() => {
	    	elapsedTime = Date.now() - startTime;

	        document.getElementById("timer").textContent = elapsedTime;
	    }, 1);
	}

	function stopTimer() {
		// store elapsed time
		console.log("timer stopped.")
		clearInterval(timerInterval);
	    timerInterval = null;
	}

	////////////////////////////
	// START RECORDING FUNCTION
	function startRecording() {
		console.log("start recording");
		recordingState = true;
		drawingEnabled = true;
		// start timer
		startTimer();
		// start audio recording
		let options = {mimeType: 'audio/webm'};
		recordedBlobs = [];
		try {
			mediaRecorder = new MediaRecorder(window.stream, options);
		} catch (e0) {
			console.log('Unable to create MediaRecorder with options Object: ', e0);
			try {
		  		options = {mimeType: 'audio/mp3'};
		  		mediaRecorder = new MediaRecorder(window.stream, options);
			} catch (e1) {
				console.log('Unable to create MediaRecorder with options Object: ', e1);
		  		try {
		    		options = 'audio/mp3'; // Chrome 47
		    		mediaRecorder = new MediaRecorder(window.stream, options);
		  		} catch (e2) {
		    		alert('MediaRecorder is not supported by this browser.\n\n' +
		        	'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
		    		console.error('Exception while creating MediaRecorder:', e2);
		    		return;
		  		}
			}
		}
		console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
		mediaRecorder.onstop = handleStop;
		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.start();
		console.log('MediaRecorder started', mediaRecorder);
	}

	function handleStop(event) {
		console.log('Recorder stopped: ', event);
		console.log('Recorded Blobs: ', recordedBlobs);

		console.log('mouseXY: ', mouseXY);

		// console.log(recordedBlobs);
		// get UTC timestamp to use as filename for blob
		let timestamp = new Date();
		let timestamp_ms = timestamp.getTime();
		let blob_fn = `blob_${timestamp_ms}`
		// save recordedBlob as file on server in blob directory
		// blobToFile(recordedBlobs[0],'/blob/' + blob_fn);

		// send data to db - recordedBlobs, mouseXY, elapsedTime
		saveRecording(blob_fn, recordedBlobs[0], mouseXY, elapsedTime);
	}

	function handleDataAvailable(event) {
	  if (event.data && event.data.size > 0) {
	    recordedBlobs.push(event.data);
	  }
	}


	// STOP RECORDING FUNCTION
	function stopRecording() {
		console.log("stop recording");
		recordingState = false;
		drawingEnabled = false;
		// stop timer and record elapsed time
		stopTimer();
		// stop audio recording
		mediaRecorder.stop();

		
	}

	function saveRecording(filename, audioBlob, mouseXY, elapsedTime) {
		// let sendData = {
		// 	"blob_filename": filename,
		// 	"audio": audioBlob,
		// 	"mouseXY": mouseXY,
		// 	"elapsedTime": elapsedTime
		// }
		let formData = new FormData();

		// formData.append('blob_fn', filename);
		formData.append('audioBlob', audioBlob, filename);
		formData.append('mouseXY', JSON.stringify(mouseXY));
		formData.append('elapsedTime', elapsedTime);

		console.log("saveRecording data: ", formData);

		fetch('/saverecord', {
			method: 'POST',
			body: formData
		})
		.then(response => response.text())
		.then(data => {
			console.log("Sent: ", data); // handle success response
			// redirect
			// window.location.href = '/';
		})
		.catch(error => {
			console.error('Error:', error); // handle error
		});
	}


	document.getElementById("startButton").addEventListener("click", (e) => {
	    e.preventDefault(); // Prevent default anchor behavior

	    const button = e.target;
	    
	    if (timerInterval) {
	        stopRecording();
	        button.textContent = "Start Recording";
	        button.style.backgroundColor = "blue";
	    } else {
	        startRecording();
	        button.textContent = "Stop Recording";
	        button.style.backgroundColor = "red";
	    }
	});

	// PLAY AUDIO RECORDING
	document.getElementById("playButton").addEventListener("click", (e) => {
	    e.preventDefault(); // Prevent default anchor behavior

	    const button = e.target;
	    
	    // play blob recording
	    console.log("TYPE", recordedBlobs[0].type);
	    playAudio(recordedBlobs[0]);
	});

	function playAudio(audioBlob) {
		if (audioBlob) {
    		const audio = new Audio();
    		audio.src = URL.createObjectURL(audioBlob);
    		audio.play();
  		}
	};

});

