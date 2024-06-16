console.log("play.js loaded");
console.log(window.location.pathname);

let turncounter = ["ignore", 0, 0];
let whosecolor = ["ignore", "#e66afc", "#4bbf85"]
let whoseround = 1;
let timer = 0;

function preload(){
	img = loadImage('/img/plane-glacier.jpg'); // Load the image
	// audio1 = loadSound('assets/Jacob.wav');
	// audio2 = loadSound('assets/Felix.wav');
}



function setup() {
	let canvas = createCanvas(800, 500);
	canvas.parent("image-container");
	stroke('rgba(0,0,0,0)')
	strokeCap(PROJECT);
	strokeJoin(ROUND);
	fill("rgba(0, 0, 0, 0)")
	strokeWeight(5)
	strokeCap(ROUND);

	background(img);

}

function draw() {

    if (getAudioContext().state !== 'running') {
    console.log('click to start audio');
  } else {
    //console.log('audio is enabled');
    //if it is not playing, play it
    if (!audio1.isPlaying()){
        // make it play
        audio1.play();
        audio2.play();
    }

    //audio is playing, so we can draw
    if (millis() >= 100+timer) {
      //if timer is correct value indicates we should play next step

      if (whoseround == 1){
        drawarray(array1, turncounter[1], whosecolor[1]);
        whoseround++;
      }

      if (whoseround == 2){
        drawarray(array2, turncounter[2], whosecolor[2]);
        whoseround = 1;
        timer = millis();
      }

    }



  }
}

function drawarray(array, turn, colorHEX){
    beginShape();
    turn++;

    stroke(colorHEX)
    if (array[turn] == "beginShape();"){
      turn++;
    }

    let result = array[turn].replace("vertex(",'');
    let result2 = result.replace(");",'');
    console.log("result 2 for" +  turn + " is = " + result2);
    result3 = result2.split(",");
    vertex(result3[0], result3[1]);
    turn++

    if (array[turn] == "endShape()"){
      endShape();
      turn++

      turncounter[whoseround] = turn;
    }
    else {
      let result = array[turn].replace("vertex(",'');
      let result2 = result.replace(");",'');
      console.log("result 2 for" +  turn + " is = " + result2);
      result3 = result2.split(",");
      vertex(result3[0], result3[1]);
      turn++;

      endShape();
      turn++;

      turncounter[whoseround] = turn;

    }

    if (array[turn] == "FINAL"){
    noLoop();
    }


}



function mousePressed (){
  userStartAudio();
  }