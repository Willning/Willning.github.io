const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_SPACE = 32;
const KEY_SHIFT = 16;
 
 // module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;
Body = Matter.Body;
Runner = Matter.Runner;
Mouse = Matter.Mouse;
MouseConstraint = Matter.MouseConstraint;

canvas = document.getElementById('canvas');

    // create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;

    // create a renderer
var render = Render.create({
    element: document.body,
    canvas: canvas,
    engine: engine,
    options: {
        width: 800,
        height: 600,
    }
});

    // create two boxes and a ground
var boxA = Bodies.rectangle(200, 150, 80, 80);

var boxB= Bodies.rectangle(200, 250, 80, 80);

    // add all of the bodies to the world
World.add(engine.world, [boxA,boxB]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

var runner = Runner.create();
//Runner.run(runner, engine);

// add bodies
World.add(engine.world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.02,
            render: {
                visible: false
            }
        }
    });

World.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

var last_time = 0;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});

requestAnimationFrame(draw);

function draw(now){    
    //Engine.update(engine, 1000/60, 1);     
    Runner.tick(runner, engine, (last_time - now));
    last_time = now;
    //Body.applyForce(boxA,boxA.position,{x:0.0001,y:0})

    requestAnimationFrame(draw);
}

window.addEventListener('deviceorientation', e => {
        //use beta and gamma to recalc gravity.
        engine.world.gravity.x = Math.sin(e.gamma * 0.0174533) * 0.5;
        engine.world.gravity.y = Math.sin(e.beta * 0.0174533) * 0.5;
    }

);