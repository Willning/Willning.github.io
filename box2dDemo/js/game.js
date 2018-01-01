var initId = 0;
var player = function(){
	this.object = null;
	this.canJump = false;
};
var world;
var ctx;
var canvasWidth;
var canvasHeight;
var keys = [];

// HTML5 onLoad event
Event.observe(window, 'load', function() {
	world = createWorld(); // box2DWorld

	ctx = $('myCanvas').getContext('2d'); // 2
	var canvasElm = $('myCanvas');
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	initGame(); // 3
	step(); // 4
	
// 5
	window.addEventListener('keydown',handleKeyDown,true); 
	window.addEventListener('keyup',handleKeyUp,true);
});

//create the world and its objects

function initGame(){
	
	
	// create player ball
	var ballSd = new b2CircleDef();
	ballSd.density = 0.1;
	ballSd.radius = 12;
	ballSd.restitution = 0.5;
	ballSd.friction = 1;
	ballSd.userData = 'player';
	var ballBd = new b2BodyDef();
	ballBd.linearDamping = .03;
	ballBd.allowSleep = false;
	ballBd.AddShape(ballSd);
	ballBd.position.Set(20,20);
	player.object = world.CreateBody(ballBd);
	
}

function step() {

	handleInteractions();
	var stepping = false;
	var timeStep = 1.0/60;
	var iteration = 1;
	// 1
	world.Step(timeStep, iteration);
	// 2
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawWorld(world, ctx);
	// 3
	setTimeout('step()', 10);
}

function handleInteractions(){
	// up arrow
	// 1
	var collision = world.m_contactList;

	var vel = player.object.GetLinearVelocity();
	var dir = player.object.GetRotation();
	
	// 3
	if (keys[38]){
		vel.y = -150;
		//trig out the direction	
	}else if(keys[40]){
		vel.y = 150;
	}
	// left/right arrows
	if (keys[37]){
		//left
		player.object.SetAngularVelocity(5);
		
	}
	else if (keys[39]){		
		//right
		player.object.SetAngularVelocity(-5);
	}
	
	// 5
	player.object.SetLinearVelocity(vel);	

}

function handleKeyDown(evt){
	keys[evt.keyCode] = true;
}


function handleKeyUp(evt){
	keys[evt.keyCode] = false;
	player.object.SetAngularVelocity(0);
}

// disable vertical scrolling from arrows :)
document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40}


