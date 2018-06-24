// Need to use xampp-control to view in google chrome.
// Type in address http://127.0.0.1/atticfires10.html or other 127.0.0.1 address to reference to html file and open in chrome.
// .html and .js files are stored in C:\xampp\htdocs folder.

// The way its supposed to work:

// There are three scenes of video, all begin and end on the same image allowing transitions between them at these points.

// The scenes are of different length and so contain different numbers of frames
// e.g. 2000, 2300, 1800

// The mouse height on the window is scaled to the number of a frame of video.

// The frames indexed by the mouse height is called a reel. The ratio of mouse height to number of frames in a reel is REEL_DURATION (reel length).
// e.g. a reel is 50 frames because REEL_DURATION is set to 50. 
// This means that moving the mouse up and down the page will index 50 frames. Frame number 0 at the top and frame 50 at the bottom.

// When the mouse moves down the window beyond a certain point and moves back up the window, 
// the reel changes and the indexing is incremented so that the following 50 frames are shown. In this way the viewer can scroll through the video.

// Every reel contains the same number of frames to mouse height ratio, 
// except the transition reels which carry the remainder from the 50 frame per reel division of the scene frames.

// Description of code contents:

// Mapping of mouse to frames for even number reels and odd number reels ( except transition reels)
// Mapping of mouse to frames for three transition reels.

// Conditional statements for even reels, managing transitions when mouse reaches bottom of screen
// Conditional statements for odd reels, managing transitions when mouse reaches bottom of screen

// Conditional statements for even reels, managing transitions when mouse reaches top of screen
// Conditional statements for odd reels, managing transitions when mouse reaches top of screen

// Conditional statements for 3 transition reels, managing transitions to one of a series of reels corresponding to beginning of new scene, chosen at random when mouse reaches bottom of screen
// Conditional statements for 3 transition reels, managing transitions to one of a series of reels corresponding to beginning of new scene, chosen at random when mouse reaches top of screen

//Scene Timecodes in Minutes and Seconds:

//Scene 1
// 0.00
// 7.05

//Scene2
// 7.05
// 13.36

//Scene3
// 13.36
// 19.05

// Scene 1 = 425 seconds

// Scene 2 = 801.6 - 425 =  376.6 seconds

// Scene 3 = 1143 - 801.6 =  341.4 seconds

//Division of Scenes into reels based on reel legnth of 10seconds
// Scene 1/10 = 425/10 = 42.5

// reel 0 = 0-10 seconds
// reel 42 = 420 seconds
// reel 42 = 420 - 425 seconds

// Scene 2/10

// reel 43 = 425
// 376.6/10 = 37.66
// 37 reels 38th carries remainder of 6.6 seconds

// 44 + 37 = 81
// reel 81 = 425 + 370 = 795
// reel 82 = 795 + 6.6 = 801.6

// Scene 3/10

// 341.4/10 = 34.14
// 34 reels 35th carries remainder of  1.4 seconds

// 82 + 34 = 116
// reel 116 = 801.6 + 340 = 1141.6
// reel 117 = 1141.6 + 1.4 = 1143

//main problem at the moment is cant get transitions to work, dont know if problem with transLimit or where its called
// or something wrong with this:
//if (winMouseY>(window.innerHeight-transLimit) && reel <= reelCeiling && reel %2===0 && evenCounter > (oddCounter + reelDelay)

//window.requestAnimationFrame = window.requestAnimationFrame
//     || window.mozRequestAnimationFrame
//     || window.webkitRequestAnimationFrame
//     || window.msRequestAnimationFrame
//     || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60
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

//var rTransOne,rTransTwo,rTransThree are arrays with options for reel values to be chosen randomly at random transition points
//variable oddCounter/evenCounter is used to keep track of whether the user has just tranistioned to a new reel or not.
// the counter value changes to 1 when reel is changed for e.g. from 0 to 1. plus a time delay (reelDelay)
// this reelDelay prevents contradictions occuring and allows different behaviour for when the viewer holds the mouse in the top or bottom of the canvas.
// if reel = 1 and counter = 1 then bringing mouse below a certain point will make reel = 0
// this is not possible if reel =1 and counter =0 thus preventing a strange feedback loop immediately after reel=1 ( as mouse position will likely still be at bottom of canvas)
// after reel =0 is changed another delay is applied before counter = 0, allowing the mouse to transition back to reel=1 if so desired.

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

//   var transLimit = (innerHeight/100)*5 ;//size of distance from screen limits that transtion will be triggered in

//   if (reel %2===0 || reel === 0 && reel < rTransOne) {
//     reelPosition = map(winMouseY,0,window.innerHeight,(reel*REEL_DURATION),((reel*REEL_DURATION)+REEL_DURATION), true);
//     evenCounter++;
//     // if reel is even ( divisible by 2, and before the first transition reel) value y is given value mapped to dimensions of canvas
//     // evenCounter adds a count for each iteration
//   }
//   else if (reel %2!==0 && reel < rTransOne) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION),((reel*REEL_DURATION)+REEL_DURATION), true);
//     oddCounter++;

//     // if reel is odd (not divisible by 2, and not one of the irregular reels) value y is given value mapped to dimensions of canvas
//     // oddCounter adds a count for each iteration

// //PROBLEM - map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION),((reel*REEL_DURATION)+REEL_DURATION)
//   // This method of generating range of values for each reel no longer makes sense after first irregular reel.
//   // as reel 42 is only 5 seconds large, reel 43 begins on second 425. Hence, reel=43*REEL_DURATION(10) = 430 - we are out of sync.
//   // different rules will need to apply to reels above a certain point, and different compensations will need to be added.
//   }
//   else if (reel %2===0 || reel === 0 && reel < rTransTwo && reel !== rTransOne) {
//     reelPosition = map(winMouseY,0,window.innerHeight,(reel*REEL_DURATION+t1L),((reel*REEL_DURATION+t1L)+REEL_DURATION), true);
//     evenCounter++;
//   }
//   else if (reel %2!==0 && reel < rTransTwo && reel !== rTransOne) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION+t1L),((reel*REEL_DURATION+t1L)+REEL_DURATION), true);
//     oddCounter++;
//   }
//   else if (reel %2===0 || reel === 0 && reel < rTransThree && reel !== rTransTwo) {
//     reelPosition = map(winMouseY,0,window.innerHeight,(reel*REEL_DURATION+t1L+t2L),((reel*REEL_DURATION+t1L+t2L)+REEL_DURATION), true);
//     evenCounter++;
//   }
//   else if (reel %2!==0 && reel < rTransThree && reel !== rTransTwo) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION+t1L+t2L),((reel*REEL_DURATION+t1L+t2L)+REEL_DURATION), true);
//     oddCounter++;
//   }
//   // three reels rTransOne, rTransTwo and rTransThree which are smaller than the standard 50
//   else if (reel === rTransOne) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION),((reel*REEL_DURATION)+t1L), true);
//     oddCounter++;
//   }
//   else if (reel === rTransTwo) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION+t1L),((reel*REEL_DURATION+t1L)+t2L), true);
//     oddCounter++;
//   }
//   else if (reel === rTransThree) {
//     reelPosition = map(winMouseY,window.innerHeight,0,(reel*REEL_DURATION+t1L+t2L),((reel*REEL_DURATION+t1L+t2L)+t3L), true);
//     oddCounter++;
//   }

//   // transitions from top to bottom excepting rTransOne,Two,Three
//   if (winMouseY>(window.innerHeight-transLimit) && reel <= reelCeiling && reel %2===0 && evenCounter > (oddCounter + reelDelay)
//     && reel !== rTransOne && reel !== rTransTwo && reel !== rTransThree) {
//     reel++;
//     evenCounter = 0;
//   //if reel is even, less than or equal to highest reel, and if a set delay has passed, 
//   //the reel will increase once the mouse reaches the bottom of the screen ( not applicable if reels rTransOne,Two,Three)
//   //the evenCounter is then wiped
//   }
//   else if (winMouseY>(window.innerHeight-transLimit) && reel <= reelCeiling && reel %2!==0 && oddCounter > (evenCounter + reelDelay)
//     && reel !== rTransOne && reel !== rTransTwo && reel !== rTransThree) {
//     reel--;
//     oddCounter = 0;
//   }
//   //if reel is odd, less than or equal to highest reel, and if a set delay has passed, 
//   //the reel will decrease once the mouse reaches the bottom of the screen ( not applicable if reels rTransOne,Two,Three)
//   //the oddCounter is then wiped
 
//   // transitions from bottom to top excepting rTransOne,Two,Three
//   else if (winMouseY<transLimit && reel <= reelCeiling && reel %2!==0 && oddCounter > (evenCounter + reelDelay)
//     && reel !== rTransOne && reel !== rTransTwo && reel !== rTransThree) {
//     reel++;
//     oddCounter = 0;
//   } 
//   else if (winMouseY<transLimit && reel> reelFloor && reel %2===0 && evenCounter > (oddCounter + reelDelay)
//     && reel !== rTransOne && reel !== rTransTwo && reel !== rTransThree){
//     reel--;
//     evenCounter = 0;
//   }
//   //top to bottom transitions between randomly selected portions - rTransOne,Two,Three
//   else if (winMouseY>(window.innerHeight-transLimit) && reel == rTransOne && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransOneTo);
//     oddCounter = 0;
//   }
//   else if (winMouseY>(window.innerHeight-transLimit) && reel == rTransTwo && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransTwoTo);
//     oddCounter = 0;
//   }
//   else if (winMouseY>(window.innerHeight-transLimit) && reel == rTransThree && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransThreeTo);
//     oddCounter = 0;
//   }
//   //bottom to top transitions between randomly selected portions - reels 9, 17 and 25
//   else if (winMouseY<transLimit && reel == rTransOne && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransOneTo);
//     oddCounter = 0;
//   }
//   else if (winMouseY<transLimit && reel == rTransTwo && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransTwoTo);
//     oddCounter = 0;
//   } 
//   else if (winMouseY<transLimit && reel == rTransThree && oddCounter > evenCounter + reelDelay) {
//     reel = random(reelTransThreeTo);
//     oddCounter = 0;
//   }
    
//   // console.log(reelPosition);
//   // console.log(winMouseY);
//   // console.log(window.innerHeight);
//   // console.log(transLimit);
//   // console.log(evenCounter);
//   // console.log(oddCounter);

//   // vid.time(reelPosition);
//   // requestAnimationFrame(draw);
}

//requestAnimationFrame(draw);

function mouseWheel(event) {
  clearTimeout(pauseTimeout);
  console.log("playing video");
  console.log(vid.time());

  if (event.delta >= 0) {
    reelPosition = vid.time() + SCROLL_SECONDS;
    playForDuration(SCROLL_SECONDS);
  }
  else {
    vid.pause();
    reelPosition = vid.time() - SCROLL_SECONDS;
    //playBackwardsForDuration(SCROLL_SECONDS);
    vid.time(reelPosition);
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