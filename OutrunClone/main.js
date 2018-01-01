window.onload = function(){

//@TODO refactor the constants into another file for the sake of readability

//Model portion of code


//car statistics
var speed = 0;
var playerX= 0; //player offset from the center of the road
var position = 0; // players z position (distance from start position added to camera distance)

var img = null;

//movement booleans
var foward = false;
var braking = false; 
var left = false;
var right = false; 


//road constants
var segmentLength = 200; // length of a single segment
var rumbleLength  = 3;     // number of segments per red/white rumble strip
var segments = []; //array of road segments
var trackLength = null; //length of the track
var drawDistance = 150; //number of segments
var roadWidth = 2000; 
var cameraHeight = 1000;
var cameraDepth = 1 / Math.tan((50) * Math.PI/180);;
var lanes = 3;

//car constants
const MAXSPEED = segmentLength/step; //maximum speed
const ACCELERATION =MAXSPEED/4; //rate of speed gain
const DECELERATION = -MAXSPEED/10; //speed loss whils coasting
const BRAKING = -MAXSPEED/2; //rate of braking
const OFFROADSPEED = MAXSPEED/3;


//View portion of code

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

 var callback = function(results){
    console.log("all loaded");
 }

//load images onto the page (used for sprites and stuff)
function loadImage(src, callback) {
  var img = document.createElement('img');
  img.addEventListener('load', function() { callback(img); } , false);
  img.src = src;
  return img;
}



//Find segment z.
function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

//reset the road 
function resetRoad() {
  segments = [];
  for(var n = 0 ; n < 500 ; n++) { // arbitrary road length
    segments.push({
       index: n,
       p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
       p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
       color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
    });
  }

  trackLength = segments.length * segmentLength;
}

function renderRoad(){
    var maxy = height;
    var baseSegment = findSegment(position);

    var n, segment;
      for(n = 0 ; n < drawDistance ; n++) {
        segment = segments[(baseSegment.index + n) % segments.length];
        segment.looped = segment.index < baseSegment.index;
       
        Util.project(segment.p1, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        if ((segment.p1.camera.z <= cameraDepth) || // behind us
            (segment.p2.screen.y >= maxy))          // clip by (already rendered) segment
          continue;
        Render.segment(ctx, width, lanes,
                       segment.p1.screen.x,
                       segment.p1.screen.y,
                       segment.p1.screen.w,
                       segment.p2.screen.x,
                       segment.p2.screen.y,
                       segment.p2.screen.w,
                       segment.fog,
                       segment.color);
        maxy = segment.p2.screen.y;
      }
}


//Control portion of code

//Timing code
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var now, dt, last = timestamp();

function frame(){
    now = timestamp();
    dt = (now-last)/1000; //time in seconds
    update(dt);
    render(dt);
    last = now;
    requestAnimationFrame(frame);

}

function update(dt){

    position = Util.increase(position, dt * speed, trackLength);
    var playerSegment = findSegment(position+playerZ);

    var dx = dt * 2 * (speed/MAXSPEED); // turnrate increases with speed

    //power and braking controls
    if (foward && speed < MAXSPEED){
        speed = Util.accelerate(speed, ACCELERATION, dt);
        //@TODO change this into a progressive acceleration curve
    }else if (braking){
        if (speed>0){
             speed = Util.accelerate(speed, BRAKING, dt);
        }else{
            speed = 0;
        }
    }else{
        if(speed>0){
             speed = Util.accelerate(speed, DECELERATION, dt);
        }else{
            speed = 0;
        }
    }

    //steering controls
    if(left){
        playerX = playerX-dx;
    }else if(right){
        playerX = playerX+dx;
    } 

    if ((playerX > 1 || playerX < -1)&&speed>OFFROADSPEED){
        //off the track
        speed = Util.accelerate(speed,DECELERATION*5,dt);
   }

    playerX = Util.limit(playerX, -2, 2);     // dont let player go too far out of bounds
    speed   = Util.limit(speed, 0, MAXSPEED); // or exceed maxSpeed

    
}

function render(dt){
    var baseSegment = findSegment(position);

    ctx.clearRect(0, 0, width, height); //clear the canvas before adding new things    
   
    renderRoad();

    //ctx.drawImage(sprites,0, 122,190, 122,(width/2)-190/2,250,190,122); //image is now drawn here, rework sprite cutting

    Render.player(ctx, playerX, speed, left, right, sprites);

    ctx.font = "bold 14px verdana, sans-serif";
    ctx.fillStyle="#FFFFFF";
    ctx.fillText(Math.round(speed/100) + "km/h",width/2-40, 15);


}

//Player input code (control)
var KEY = {
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,
  A:     65,
  D:     68,
  S:     83,
  W:     87
};

document.addEventListener("keydown", onkeydown, false);
document.addEventListener("keyup", onkeyup, false);

function onkeydown(event){

    //power
   if (event.which === KEY.W || event.which === KEY.UP){
        //moving foward
        foward = true;
        braking = false;

   }else if(event.which === KEY.S||event.which === KEY.DOWN){
        //braking
        foward = false;
        braking = true;
   }

   //steering
   if(event.which === KEY.A || event.which === KEY.LEFT){
        left=true;
        right=false;
   }else if(event.which === KEY.D || event.which ===KEY.RIGHT){
        right = true;
        left = false; 
   }
}

function onkeyup(event){
    if (event.which === KEY.W || event.which === KEY.UP){
        //moving foward
        foward = false;
        

   }else if(event.which === KEY.S||event.which === KEY.DOWN){
        //braking     
        braking = false;

   }

    //steering
   if(event.which === KEY.A || event.which === KEY.LEFT){
        left=false;
        
   }else if(event.which === KEY.D || event.which ===KEY.RIGHT){
        right = false;
        left = false; 
   }
}

//Entry point here. maybe even move this to another document
var resolution = height/480;
var playerZ = cameraHeight *cameraDepth;
var sprites = loadImage("./images/spriteSet.png" , function(sprites){
    console.log("ready to play");
    resetRoad();
    requestAnimationFrame(frame); //start the game loop
});


}
