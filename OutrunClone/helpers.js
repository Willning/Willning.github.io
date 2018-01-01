//In this file we put constants and other helper functions

//Color constants
var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  FOG:  '#005108',
  LIGHT:  { road: '#6B6B6B', grass: '#10AA10', rumble: '#FF0000', lane: '#CCCCCC'  },
  DARK:   { road: '#696969', grass: '#009A00', rumble: '#FFFFFF'                   },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
};

//page constants
const width = 600; //width of the canvas
const height = 400; //height of the canvas
const fps = 60;
const step = 1/fps;

//Utility methods
var Util = {

	accelerate: function(speed, accel, dt){
		return speed+(accel*dt);
	},

	increase:  function(start, increment, max) { // with looping
	    var result = start + increment;
	    while (result >= max)
	      result -= max;
	    while (result < 0)
	      result += max;
	    return result;
    
    },

  limit: function(value, min, max)   { 
  	return Math.max(min, Math.min(value, max)); //brings the value into an acceptable range.
    }, 

  //project the shapes given the camera location
  project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    p.camera.x     = (p.world.x || 0) - cameraX;
    p.camera.y     = (p.world.y || 0) - cameraY;
    p.camera.z     = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth/p.camera.z;
    p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
    p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
    p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
    },

  overlap: function(x1, w1, x2, w2, percent) {
    var half = (percent || 1)/2;
    var min1 = x1 - (w1*half);
    var max1 = x1 + (w1*half);
    var min2 = x2 - (w2*half);
    var max2 = x2 + (w2*half);
    return ! ((max1 < min2) || (min1 > max2));
    }

}

//Rendering object
var Render = {

  polygon: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  },

  //---------------------------------------------------------------------------

  segment: function(ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

    var r1 = Render.rumbleWidth(w1, lanes),
        r2 = Render.rumbleWidth(w2, lanes),
        l1 = Render.laneMarkerWidth(w1, lanes),
        l2 = Render.laneMarkerWidth(w2, lanes),
        lanew1, lanew2, lanex1, lanex2, lane;
    
    ctx.fillStyle = color.grass;
    ctx.fillRect(0, y2, width, y1 - y2);
    
    Render.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
    Render.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
    Render.polygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);
    
    if (color.lane) {
      lanew1 = w1*2/lanes;
      lanew2 = w2*2/lanes;
      lanex1 = x1 - w1 + lanew1;
      lanex2 = x2 - w2 + lanew2;
      for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
        Render.polygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
    }   
    
  },

  //---------------------------------------------------------------------------

  background: function(ctx, background, width, height, layer, rotation, offset) {

    rotation = rotation || 0;
    offset   = offset   || 0;

    var imageW = layer.w/2;
    var imageH = layer.h;

    var sourceX = layer.x + Math.floor(layer.w * rotation);
    var sourceY = layer.y
    var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    var sourceH = imageH;
    
    var destX = 0;
    var destY = offset;
    var destW = Math.floor(width * (sourceW/imageW));
    var destH = height;

    ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    if (sourceW < imageW)
      ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
  },

  //---------------------------------------------------------------------------

  //@TODO twiddle with this too
  sprite: function(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {


                    //  scale for projection AND relative to roadWidth (for tweakUI)
    var destW  = (sprite.w * scale * width/2) * (SPRITES.SCALE * roadWidth);
    var destH  = (sprite.h * scale * width/2) * (SPRITES.SCALE * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;

    if (clipH < destH){
      ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h*clipH/destH), destX, destY, destW, destH - clipH);

    }
  },


  //simplified method for loading a sprite. 
  simpleSprites: function(ctx, width, height, sprites, sprite, x, y, flip){
  	var clipX = sprite.x;
  	var clipY = sprite.y;
  	var clipW = sprite.w;
  	var clipH = sprite.h;

  	if (flip){
  		ctx.translate(x+sprite.w,y);
  		ctx.scale(-1,1);
  		ctx.drawImage(sprites, clipX, clipY, clipW, clipH, 0, 0, width, height);
  		ctx.setTransform(1,0,0,1,0,0);
  	}else{
  		ctx.drawImage(sprites, clipX, clipY, clipW, clipH, x, y, width, height);
  	}
  	
  },


  //---------------------------------------------------------------------------

  //render the player car based on the speed and the steering angle.
  player: function(ctx, playerX, speed, left, right, sprites){
  	//TODO include bouncing based on speed.
  	var bounceCoeff; //hw bumpy the ride is

  	if (playerX > 1||playerX < -1){
  		bounceCoeff = 2000;
  	}else{
  		bounceCoeff =8000;
  	}

  	var bounce = speed/bounceCoeff * (Math.random()*2 -1);
  	//uses draw sprite
  	var sprite;
  	var flip = false;

  	if (left && speed>0){
  		flip = false;
  		sprite = SPRITES.CARM;
  	}else if(right &&speed>0){
  		flip = true;
  		sprite = SPRITES.CARM;
  	}else{
  		flip =false;
  		sprite = SPRITES.CAR;
  	}

  	Render.simpleSprites(ctx, 195, 130, sprites, sprite, width/2 - 190/2, 220 + bounce, flip);
  },

  //---------------------------------------------------------------------------

  fog: function(ctx, x, y, width, height, fog) {
    if (fog < 1) {
      ctx.globalAlpha = (1-fog)
      ctx.fillStyle = COLORS.FOG;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  },

  rumbleWidth:     function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(6,  2*lanes); },
  laneMarkerWidth: function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(32, 8*lanes); }


}

var SPRITES = {
	CAR : { x: 0 ,y: 122, w: 190, h: 122}, //straight going
	CARM :{ x: 190, y:122, w: 195, h:122}, //slight turn
	CARF: { x: 300, y:122, w: 258, h:122} //big
}