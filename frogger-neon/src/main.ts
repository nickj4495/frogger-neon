import * as pc from 'playcanvas';
import './style.css';

import { Player } from './Player';
import { TrafficLane } from './TrafficLane';
import { RiverLane } from './RiverLane';
import { Game } from './Game';

// --------------------------------------------------
// APP
// --------------------------------------------------

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new pc.Application(canvas, {
    keyboard: new pc.Keyboard(window),
    mouse: new pc.Mouse(canvas),
});

app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

app.resizeCanvas(
    window.innerWidth,
    window.innerHeight
);

window.addEventListener('resize', () => {
    app.resizeCanvas(
        window.innerWidth,
        window.innerHeight
    );
});

// Dark nighttime background
app.scene.exposure = 1.2;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createMaterial(color: pc.Color): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.diffuse = color;
    material.update();

    return material;
}

function createBox(
    name: string,
    position: pc.Vec3,
    scale: pc.Vec3,
    color: pc.Color
): pc.Entity {
    const entity = new pc.Entity(name);

    entity.addComponent('render', {
        type: 'box',
    });

    entity.setPosition(position);
    entity.setLocalScale(scale);

    if (entity.render) {
        entity.render.material = createMaterial(color);
    }

    app.root.addChild(entity);

    return entity;
}

// --------------------------------------------------
// COLORS
// --------------------------------------------------

const grassColor = new pc.Color(0.03, 0.12, 0.09);
const roadColor = new pc.Color(0.035, 0.04, 0.055);
const sidewalkColor = new pc.Color(0.12, 0.13, 0.16);

const neonGreen = new pc.Color(0.1, 1, 0.45);
const neonPink = new pc.Color(1, 0.05, 0.5);
const neonBlue = new pc.Color(0.05, 0.65, 1);

// --------------------------------------------------
// WORLD
// --------------------------------------------------

// Starting area
createBox(
    'Start',
    new pc.Vec3(0, -0.25, 5),
    new pc.Vec3(16, 0.5, 4),
    grassColor
);

// Road
createBox(
    'Road',
    new pc.Vec3(0, -0.3, 0),
    new pc.Vec3(16, 0.5, 6),
    roadColor
);

// Goal area
createBox(
    'Goal',
    new pc.Vec3(0, -0.25, -11),
    new pc.Vec3(16, 0.5, 2),
    grassColor
);

createBox(
    'Median',
    new pc.Vec3(0, -0.25, -4),
    new pc.Vec3(16, 0.5, 2),
    grassColor
);

const waterColor = new pc.Color(
    0.015,
    0.08,
    0.16
);

createBox(
    'River',
    new pc.Vec3(0, -0.35, -7),
    new pc.Vec3(16, 0.5, 4),
    waterColor
);

// Sidewalks
createBox(
    'BottomSidewalk',
    new pc.Vec3(0, 0, 3),
    new pc.Vec3(16, 0.2, 0.8),
    sidewalkColor
);

createBox(
    'TopSidewalk',
    new pc.Vec3(0, 0, -3),
    new pc.Vec3(16, 0.2, 0.8),
    sidewalkColor
);

// --------------------------------------------------
// PLAYER
// --------------------------------------------------

const player = createBox(
    'Player',
    new pc.Vec3(0, 0.5, 5),
    new pc.Vec3(0.8, 0.8, 0.8),
    neonGreen
);

const frog = new Player(app, player);

// --------------------------------------------------
// TRAFFIC
// --------------------------------------------------

const trafficLanes = [
    new TrafficLane(app, {
        z: 2,
        speed: 3,
        direction: 1,
        vehicleCount: 3,
        spacing: 6,
        color: neonPink,
        vehicleLength: 1.8,
    }),

    new TrafficLane(app, {
        z: 0,
        speed: 4.5,
        direction: -1,
        vehicleCount: 3,
        spacing: 7,
        color: neonBlue,
        vehicleLength: 2.4,
    }),

    new TrafficLane(app, {
        z: -2,
        speed: 5.5,
        direction: 1,
        vehicleCount: 4,
        spacing: 5,
        color: new pc.Color(1, 0.25, 0.05),
        vehicleLength: 1.5,
    }),
];

const riverLanes = [
    new RiverLane(app, {
        z: -6,
        speed: 2,
        direction: 1,
        logCount: 3,
        spacing: 7,
        logLength: 3.5,
    }),

    new RiverLane(app, {
        z: -7,
        speed: 2.8,
        direction: -1,
        logCount: 3,
        spacing: 7,
        logLength: 3,
    }),

    new RiverLane(app, {
        z: -8,
        speed: 3.5,
        direction: 1,
        logCount: 3,
        spacing: 7,
        logLength: 4,
    }),
];

const game = new Game(
    frog,
    trafficLanes
);

// --------------------------------------------------
// LIGHT
// --------------------------------------------------

const light = new pc.Entity('Main Light');

light.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.65, 0.72, 1),
    intensity: 2,
    castShadows: true,
});

light.setEulerAngles(45, 30, 0);

app.root.addChild(light);

// --------------------------------------------------
// CAMERA
// --------------------------------------------------

const camera = new pc.Entity('Camera');

camera.addComponent('camera', {
    clearColor: new pc.Color(0.005, 0.008, 0.02),
    fov: 45,
});

camera.setPosition(0, 18, 14);
camera.lookAt(0, 0, -3);

app.root.addChild(camera);

// --------------------------------------------------
// PLAYER MOVEMENT
// --------------------------------------------------

app.on('update', (dt: number) => {
    frog.update(dt);

    for (const lane of trafficLanes) {
        lane.update(dt);
    }

    for (const lane of riverLanes) {
        lane.update(dt);
    }

    game.update();
});

// --------------------------------------------------
// START
// --------------------------------------------------

app.start();