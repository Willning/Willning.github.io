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
var drift = false;


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
var centrifugal = 0.2; //how much curves will affect the car

//car constants
const MAXSPEED = segmentLength/step; //maximum speed
const ACCELERATION =MAXSPEED/4; //rate of speed gain
const DECELERATION = -MAXSPEED/10; //speed loss whils coasting
const BRAKING = -MAXSPEED/2; //rate of braking
const OFFROADSPEED = MAXSPEED/3;

//image constants
var sprites = null;
var background = null;


//background constants
var skySpeed    = 0.001; // background sky layer scroll speed when going around curve (or up hill)
var hillSpeed   = 0.002; // background hill layer scroll speed when going around curve (or up hill)
var treeSpeed   = 0.003; // background tree layer scroll speed when going around curve (or up hill)
var skyOffset   = 0;     // current sky scroll offset
var hillOffset  = 0;     // current hill scroll offset
var treeOffset  = 0;     // current tree scroll offset

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


function loadImages(names, callback) { // load multiple images and callback when ALL images have loaded
    var result = [];
    var count  = names.length;

    var onload = function() {
      if (--count == 0)

        callback(result);
    };

    for(var n = 0 ; n < names.length ; n++) {
      var name = names[n];
      result[n] = document.createElement('img');      
      result[n].src = "images/" + name + ".png";
    }

    return result;
}

//Road Geometry stuff

//Find segment z.
function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

//curve data, will adjust this by feel.
var ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 }, // num segments
  HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6, EXTREME:   10 }
};


//return the height of the previous segment. Used to keep hills consistent.
function lastY() {
  return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y;
}

//add a single segment to the road
function addSegment(curve, y) {
  var n = segments.length;
  segments.push({
     index: n,
        p1: { world: { y: lastY() ,z:  n   *segmentLength }, camera: {}, screen: {} },
        p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
     curve: curve,
     color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
  });
}


//add a road using many sections of road
//@params, enter = entry segments, hold= hold segments, leave, corner exit.

function addRoad(enter, hold, leave, curve ,y) {
    var startY = lastY();
    var endY = startY + Util.toInt(y,0)* segmentLength;
    var n, total = enter + hold + leave;
    for(n = 0 ; n < enter ; n++)
        addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
    for(n = 0 ; n < hold  ; n++)
        addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
    for(n = 0 ; n < leave ; n++)
        addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
    }

//Function for adding a purely straight track
 function addStraight(num) {
      num = num || ROAD.LENGTH.MEDIUM;
      addRoad(num, num, num, 0);
    }


//add symmetric curve
function addCurve(num, curve) {
      num    = num    || ROAD.LENGTH.MEDIUM;
      curve  = curve  || ROAD.CURVE.MEDIUM;
      addRoad(num, num, num, curve);
    }

//add curved roads.
function addSCurves() {
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM);
    }

//reset the road 
function resetRoad() {
  segments = [];
  
  addStraight(5);

  for (var i = 0; i< 20; i++){    
    addRoad(Math.random()*100, Math.random()*100,Math.random()*100, Math.random()*10-5, Math.random()*100-50);
  }

  trackLength = segments.length * segmentLength;
}


//Road rendering
function renderRoad(playerY){
    var maxy = height;
    var baseSegment = findSegment(position);
    var basePercent = Util.percentageRemaining(position, segmentLength); 


    var dx = - (baseSegment.curve * basePercent);
    var x  = 0;

    var n, segment;
      for(n = 0 ; n < drawDistance ; n++) {
        segment = segments[(baseSegment.index + n) % segments.length];
        segment.looped = segment.index < baseSegment.index;
       
        Util.project(segment.p1, (playerX * roadWidth) - x, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        x += dx;
        dx +=segment.curve;

        if ((segment.p1.camera.z <= cameraDepth) || // behind us
            (segment.p2.screen.y >= segment.p1.screen.y) || //back face cull
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

    var speedPercent = speed/MAXSPEED;

    skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * speedPercent, 1);
    hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * speedPercent, 1);
    treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * speedPercent, 1);

    var dx = dt * 2 * (speedPercent); // turnrate increases with speed

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

    playerX = playerX - (dx*playerSegment.curve*speedPercent*centrifugal); //here is where the turns will affect the player vehicle

}

function render(dt){
    var baseSegment = findSegment(position);

    ctx.clearRect(0, 0, width, height); //clear the canvas before adding new things
    Render.background(ctx, background, width, height, BACKGROUND.SKY,   skyOffset);
    Render.background(ctx, background, width, height, BACKGROUND.HILLS, hillOffset);
    Render.background(ctx, background, width, height, BACKGROUND.TREES, treeOffset);

    var playerSegment = findSegment(position+playerZ);
    var playerPercent = Util.percentageRemaining(position+playerZ, segmentLength);
    var playerY  = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);   
   
    renderRoad(playerY);   

    Render.player(ctx, playerX, speed, left, right, sprites, drift);
 

    ctx.font = "bold 14px verdana, sans-serif";
    ctx.fillStyle="#FFFFFF";
    ctx.fillText(Math.round(speed/100) + "km/h",width/2-40, 15);

    if (braking){
        ctx.fillStyle = "#FF0000";
        ctx.fillText("braking", width/2-40, 30);
    }


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
  W:     87,
  SPACE: 32
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

   //drift
   if (event.which ===KEY.SPACE){
        drift = true;
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

   //drifting
   if (event.which === KEY.SPACE){
        drift = false;
   }
}

//Entry point here. maybe even move this to another document
var resolution = height/480;
var playerZ = cameraHeight *cameraDepth;

var images = loadImage( "./images/spriteSet.png", function(images){
    sprites = images;
    background = loadImage("./images/background.png", function (images){

    console.log("ready to play");
    resetRoad();
    requestAnimationFrame(frame); //start the game loop
    });
});

}
