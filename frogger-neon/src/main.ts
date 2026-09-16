import * as pc from 'playcanvas';
import './style.css';

import { FollowCamera } from './core/FollowCamera';
import { Settings } from './core/Settings';
import {
    Debug,
} from './core/Debug';

import { SettingsMenu } from './ui/SettingsMenu';
import {
    FrogCollectionHUD,
} from './ui/FrogCollectionHUD';
import {
    TimerHUD,
} from './ui/TimerHUD';
import {
    GoalCelebration,
} from './ui/GoalCelebration';
import {
    CollectedFrogAnimation,
} from './ui/CollectedFrogAnimation';
import {
    LevelCompleteScreen,
} from './ui/LevelCompleteScreen';

import {
    Progression,
} from './core/Progression';

import {
    LevelCatalog,
} from './levels/LevelCatalog';

import type {
    LevelCatalogEntry,
} from './levels/LevelCatalog';

import {
    LevelSelect,
} from './ui/LevelSelect';

import type {
    Level,
} from './levels/Level';

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
Progression.load();

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

interface GameSession {
    level: Level;

    frog: Player;

    game: Game;

    followCamera:
        FollowCamera;

    playerEntity:
        pc.Entity;
}

let session:
    GameSession | null =
        null;

// --------------------------------------------------
// LEVEL
// --------------------------------------------------

const levelManager =
    new LevelManager(app);

const level =
    levelManager.load(Level01);

const frogCollectionHUD =
    new FrogCollectionHUD(
        level.getGoalColors()
    );

const collectedFrogAnimation =
    new CollectedFrogAnimation();

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

const movingPlatformLanes = [
    ...level.riverLanes,
    ...level.turtleLanes,
];

const goalCelebration =
    new GoalCelebration();

const levelCompleteScreen =
    new LevelCompleteScreen();

const game =
    new Game(
        frog,
        level,
        level.trafficLanes,
        movingPlatformLanes,

        collected => {
            frogCollectionHUD.update(
                collected
            );
        },

        result => {
            /*
             * 0.0s
             *
             * Begin cinematic push-in.
             */
            followCamera
                .startGoalCelebration();

            /*
             * 1.5s
             *
             * Reveal results once the
             * camera has established
             * Frogger.
             */
            window.setTimeout(
                () => {
                    goalCelebration.show(
                        result,

                        () => {
                            /*
                             * Player explicitly
                             * chooses to continue.
                             */
                            goalCelebration.hide();

                            followCamera
                                .endGoalCelebration();

                            /*
                             * Give the UI and
                             * camera a short
                             * moment to begin
                             * easing away before
                             * respawning.
                             */
                            window.setTimeout(
                                () => {
                                    game
                                        .continueAfterGoal();
                                },
                                550
                            );
                        }
                    );
                },
                1500
            );

            /*
             * 3.0s
             *
             * Send collected frog toward
             * its HUD slot.
             */
            window.setTimeout(
                () => {
                    const slot =
                        frogCollectionHUD
                            .getSlotCenter(
                                result.goalIndex
                            );

                    if (!slot) {
                        goalCelebration
                            .enableContinue();

                        return;
                    }

                    const startX =
                        window.innerWidth /
                        2;

                    const startY =
                        window.innerHeight /
                        2;

                    collectedFrogAnimation.fly({
                        color:
                            result.goalColor,

                        startX,

                        startY,

                        endX:
                            slot.x,

                        endY:
                            slot.y,

                        duration:
                            1100,

                        onComplete:
                            () => {
                                frogCollectionHUD
                                    .celebrateSlot(
                                        result.goalIndex
                                    );

                                goalCelebration
                                    .enableContinue();
                            },
                    });
                },
                3000
            );
        },

        result => {
            levelCompleteScreen.show(
                {
                    levelName:
                        'EDO JAPAN',

                    time:
                        result.time,

                    lives:
                        result.lives,

                    score:
                        result.score,
                },

                () => {
                    levelCompleteScreen
                        .hide();

                    /*
                     * Level Select will go
                     * here next.
                     */
                    console.log(
                        'RETURN TO LEVEL SELECT'
                    );
                }
            );
        }
    );

const timerHUD =
    new TimerHUD();

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
    clearColor: new pc.Color(
        0.005,
        0.008,
        0.02
    ),
    fov: 38,
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

const testModeIndicator =
    document.createElement(
        'div'
    );

testModeIndicator.id =
    'test-mode-indicator';

testModeIndicator.textContent =
    'TEST MODE';

document.body.appendChild(
    testModeIndicator
);

app.on(
    'update',
    (dt: number) => {
        if (
            app.keyboard?.wasPressed(
                pc.KEY_T
            )
        ) {
            const testMode =
                Debug.toggleTestMode();

            testModeIndicator.style.display =
                testMode
                    ? 'block'
                    : 'none';
        }

        if (game.isPlaying()) {
            frog.update(dt);
            levelManager.update(dt);
            game.update(dt);
        }

        timerHUD.update(
            game.getFrogTimeRemaining()
        );

        followCamera.update(dt);
    }
);

// --------------------------------------------------
// START
// --------------------------------------------------

app.start();