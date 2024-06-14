console.log("play.js loaded");

// when document ready
document.addEventListener("DOMContentLoaded", function() {

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

    let playState = false;

	// Event listeners for mouse movements
	canvas.addEventListener("click", play, {once: true});

	async function play(e) {
		console.log("PLAY!");
		playState = true;
		// LOAD DATA
		// get blobfile names
		let data = await loadData();
		let blobFiles = data.filenames;

		let audioDir = '/data/audio/';
		let jsonDir = '/data/json/';

		// variables to store loaded data
		let audioEls = []; // audio elements array
		let mouseXYs = []; // mouseXY array

		// load audioBlobs and add elements with play function

		// for each blob pairing
		for (const fn of blobFiles) {
			if (fn.slice(0,4) == 'blob') {
				// load mouseXYs from JSON
				let fp = jsonDir + fn + '.json';
				let response = await fetch(fp);
				let mouseXY = await response.json();
				// let mouseXY = await readJSON(fp);
				mouseXY.shift(); // clean data - remove first element that starts at (0,0)
				mouseXYs.push(mouseXY);

				// set up audio elements
				let audio = new Audio();
				let el = document.createElement("source");
				el.src = audioDir + fn + '.webm';
				audio.appendChild(el);
				audioEls.push(audio);
			}
		}

		let nRecords = audioEls.length;

		// start playing audio
		audioEls[0].play(); audioEls[1].play(); audioEls[2].play();

		// start redrawing
		let totalTime = calculateDrawLength(mouseXYs);

		redraw(totalTime, mouseXYs, nRecords);
	}

	function redraw(time, coord_arr, nRecords) {
		let rec_length = coord_arr[0].length;
		// console.log(coord_arr[0]);
		// line path settings
		ctx.beginPath();
    	ctx.lineWidth = 5;
    	ctx.lineCap = "round";
    	ctx.strokeStyle = "red";
    	let coord = {x:0, y:0};

		// start time interval
		let elapsedTime = 0;
		const startTime = Date.now() - elapsedTime;

	    timerInterval = setInterval(() => {
	    	elapsedTime = Date.now() - startTime;

	        // console.log("elapsedTime", elapsedTime, coord_arr[0][0][0]);

	        if (elapsedTime == coord_arr[0][0][0]) {
	        	coord.x = coord_arr[0][0][1];
	        	coord.y = coord_arr[0][0][2];
	        	console.log("PING", coord.x, coord.y);

	        	ctx.moveTo(coord.x, coord.y);
		    	// reposition(e);
		    	ctx.lineTo(coord.x, coord.y);
		    	ctx.stroke();
	        	// try {
	        		coord_arr[0].shift();
	        	// }
	        }

	        if (elapsedTime > time) {
	        	clearInterval(timerInterval);
	        }
	    }, 1);

		console.log("record", coord_arr[0]);

		

		// for (let t = 0; t < time+1; t++) {
			// console.log("time", coord_arr[0][0][0]);

			// if (t == coord_arr[0][0][0]) {
			// 	coord.x = coord_arr[0][0][1];
			// 	coord.y = coord_arr[0][0][2];
			// 	console.log(coord.x, coord.y);
			// 	// console.log(coord_arr[0][0][1]);
			// }
			// coord_arr[0].shift();
		// }
		
    	// ctx.moveTo(coord.x, coord.y);
    	// reposition(e);
    	// ctx.lineTo(coord.x, coord.y);
    	// ctx.stroke();

	}

	async function loadData() {
		let data;

		// get all filenames in list
		await fetch('/getfiles')
			.then(response => response.json())
			.then(info => {
				data = info;
			})
			.catch(error => {
				console.log(error);
			});
		return data;
	}

	// function to calculate time for drawing
	function calculateDrawLength(all_mouseXYs) {
		// take only time from array
		let max_time_per_rec = [];
		all_mouseXYs.forEach((arr) => {
			// take last point of array
			let last_point = arr.slice(-1)[0];
			max_time_per_rec.push(last_point[0]);
		})
		let max_time = Math.max(...max_time_per_rec);

		return max_time;
	}

    // function for mouse position
    function reposition(e) {
    	coord.x = e.clientX - canvas.offsetLeft;
    	coord.y = e.clientY - canvas.offsetTop;
    	// console.log(coord.x, coord.y);
    }

    function draw(e) {

		// log mouse position
		// console.log(coord);
		ctx.beginPath();
    	ctx.lineWidth = 5;
    	ctx.lineCap = "round";
    	ctx.strokeStyle = "red";
    	ctx.moveTo(coord.x, coord.y);
    	reposition(e);
    	ctx.lineTo(coord.x, coord.y);
    	ctx.stroke();
    	
    }



	// PLAY AUDIO RECORDING

	function playAudio(audioBlob) {
		if (audioBlob) {
    		const audio = new Audio();
    		audio.src = URL.createObjectURL(audioBlob);
    		audio.play();
  		}
	};

});

