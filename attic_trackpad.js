var canvas;
var vid;
var playing = false;
var completion;
var reel = 0;
var reelFloor = 0;
var reelCeiling = 117;
var reelTransOneTo = [44,83];// set of possible reels, rTransOne can transition to
var reelTransTwoTo = [0,83];// set of possible reels, rTransTwo can transition to
var reelTransThreeTo = [0,44];// set of possible reels, rTransThree can transition to
var reelPosition = 0;
var SCROLL_SECONDS = 1;
var oddCounter = 0;// while reel is odd the oddCounter accumulates
var evenCounter = 0;// while reel is even the evenCounter accumulates
var REEL_DURATION = 10;//resolution of frame to mousewidth ratio for all reels except rTransOne,Two,Three
var rTransOne = 42;// irregular sized reel (different from REEL_DURATION mouse height to frame number ratio) that forms end of first video scene.
var rTransTwo = 81;// irregular sized reel (different from REEL_DURATION ratio) that forms end of second video scene.
var rTransThree = 116;// irregular sized reel (different from REEL_DURATION ratio) that forms end of third video scene.
var t1L = 5;// irregular resolution ratio for remainder of scene1's frames
var t2L = 6.6;// irregular resolution ratio for remainder of scene2's frames
var t3L = 1.4;// irregular resolution ratio for remainder of scene3's frames

var innerWidth = $('body').innerWidth();
var innerHeight = $('body').innerHeight();

var reelDelay = 15;//delay between reel transitions occuring when mouse reaches bottom of screen 
var pauseTimeout = 0;

function setup() {
  reelPosition = 0;
  canvas = createCanvas(innerWidth, innerHeight);
  canvas.position(0,0);
  vid = createVideo("ATTICFIRESFULL.mp4", vidLoad);
  vid.size(this.canvas.width, this.canvas.height);
  vid.volume(0);
}

function vidLoad(){
  vid.play();
  vid.pause();
}

function draw() {

}

//requestAnimationFrame(draw);

function mouseWheel(event) {
  clearTimeout(pauseTimeout);
  console.log("playing video");
  console.log(vid.time());

  if (event.delta >= 0) {
    reelPosition += .1251;
    vid.time(reelPosition);
    // reelPosition = vid.time() + SCROLL_SECONDS;
    // playForDuration(SCROLL_SECONDS);
  }
  else (event.delta >= 0) {
    reelPosition -= .01251;
    vid.time(reelPosition);
    // vid.pause();
    // reelPosition = vid.time() - SCROLL_SECONDS;
    // //playBackwardsForDuration(SCROLL_SECONDS);
    // vid.time(reelPosition);
  }

  console.log("reelPosition: " + reelPosition);

  //vid.time(reelPosition);
  //vid.play();
  //requestAnimationFrame(draw);

  //uncomment to block page scrolling
  return false;
}

function playBackwardsForDuration(duration) {
  // loop here and set vid.time() for each frame? 
}

function playForDuration(duration) {
  vid.play();
    
  pauseTimeout = setTimeout(function() {
    vid.pause();
    console.log("pausing video");
  }, duration * 1000);
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  vid.size(this.canvas.width, this.canvas.height);
}