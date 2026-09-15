import * as pc from 'playcanvas';
import './style.css';

import { FollowCamera } from './core/FollowCamera';
import { Settings } from './core/Settings';
import { SettingsMenu } from './ui/SettingsMenu';

import { LevelManager } from './levels/LevelManager';
import { Level01 } from './levels/Level01';

import { Player } from './Player';
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

Settings.load();

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

const neonGreen = new pc.Color(0.1, 1, 0.45);

// --------------------------------------------------
// LEVEL
// --------------------------------------------------

const levelManager =
    new LevelManager(app);

const level =
    levelManager.load(Level01);

// --------------------------------------------------
// PLAYER
// --------------------------------------------------

const startPosition =
    level.getStartPosition();

const player = createBox(
    'Player',
    startPosition,
    new pc.Vec3(
        0.8,
        0.8,
        0.8
    ),
    neonGreen
);

const frog = new Player(
    app,
    player,
    startPosition
);

const game = new Game(
    frog,
    level,
    level.trafficLanes,
    level.riverLanes
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

const followCamera =
    new FollowCamera(
        camera,
        frog.entity
    );

const settingsMenu =
    new SettingsMenu(
        () => {
            game.pause();
        },
        () => {
            game.resume();
        }
    );

window.addEventListener(
    'keydown',
    (event) => {
        if (event.code === 'Escape') {
            settingsMenu.toggle();
        }
    }
);

// --------------------------------------------------
// PLAYER MOVEMENT
// --------------------------------------------------

app.on('update', (dt: number) => {
    if (game.isPlaying()) {
        frog.update(dt);

        levelManager.update(dt);

        game.update();
    }

    followCamera.update(dt);
});

// --------------------------------------------------
// START
// --------------------------------------------------

app.start();