import * as pc from 'playcanvas';
import './style.css';

import {
    FollowCamera,
} from './core/FollowCamera';

import {
    Settings,
} from './core/Settings';

import {
    Debug,
} from './core/Debug';

import {
    Progression,
} from './core/Progression';

import {
    SettingsMenu,
} from './ui/SettingsMenu';

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
    LevelSelect,
} from './ui/LevelSelect';

import {
    LevelCatalog,
} from './levels/LevelCatalog';

import type {
    LevelCatalogEntry,
} from './levels/LevelCatalog';

import type {
    Level,
} from './levels/Level';

import {
    LevelManager,
} from './levels/LevelManager';

import {
    Player,
} from './Player';

import {
    Game,
} from './Game';

// --------------------------------------------------
// APP
// --------------------------------------------------

const canvas =
    document.createElement(
        'canvas'
    );

document.body.appendChild(
    canvas
);

const app =
    new pc.Application(
        canvas,
        {
            keyboard:
                new pc.Keyboard(
                    window
                ),

            mouse:
                new pc.Mouse(
                    canvas
                ),
        }
    );

app.setCanvasFillMode(
    pc.FILLMODE_FILL_WINDOW
);

app.setCanvasResolution(
    pc.RESOLUTION_AUTO
);

app.resizeCanvas(
    window.innerWidth,
    window.innerHeight
);

window.addEventListener(
    'resize',
    () => {
        app.resizeCanvas(
            window.innerWidth,
            window.innerHeight
        );
    }
);

app.scene.exposure = 1.2;

Settings.load();
Progression.load();

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createMaterial(
    color: pc.Color
): pc.StandardMaterial {
    const material =
        new pc.StandardMaterial();

    material.diffuse =
        color;

    material.update();

    return material;
}

function createBox(
    name: string,
    position: pc.Vec3,
    scale: pc.Vec3,
    color: pc.Color
): pc.Entity {
    const entity =
        new pc.Entity(
            name
        );

    entity.addComponent(
        'render',
        {
            type: 'box',
        }
    );

    entity.setPosition(
        position
    );

    entity.setLocalScale(
        scale
    );

    if (entity.render) {
        entity.render.material =
            createMaterial(
                color
            );
    }

    app.root.addChild(
        entity
    );

    return entity;
}

// --------------------------------------------------
// COLORS
// --------------------------------------------------

const neonGreen =
    new pc.Color(
        0.1,
        1,
        0.45
    );

// --------------------------------------------------
// LEVEL MANAGER
// --------------------------------------------------

const levelManager =
    new LevelManager(
        app
    );

// --------------------------------------------------
// GLOBAL UI
// --------------------------------------------------

const goalCelebration =
    new GoalCelebration();

const levelCompleteScreen =
    new LevelCompleteScreen();

const collectedFrogAnimation =
    new CollectedFrogAnimation();

// --------------------------------------------------
// LIGHT
// --------------------------------------------------

const light =
    new pc.Entity(
        'Main Light'
    );

light.addComponent(
    'light',
    {
        type: 'directional',

        color:
            new pc.Color(
                0.65,
                0.72,
                1
            ),

        intensity: 2,

        castShadows: true,
    }
);

light.setEulerAngles(
    45,
    30,
    0
);

app.root.addChild(
    light
);

// --------------------------------------------------
// CAMERA
// --------------------------------------------------

const camera =
    new pc.Entity(
        'Camera'
    );

camera.addComponent(
    'camera',
    {
        clearColor:
            new pc.Color(
                0.005,
                0.008,
                0.02
            ),

        fov: 38,
    }
);

camera.setPosition(
    0,
    18,
    14
);

camera.lookAt(
    0,
    0,
    -3
);

app.root.addChild(
    camera
);

// --------------------------------------------------
// GAME SESSION
// --------------------------------------------------

interface GameSession {
    level: Level;

    frog: Player;

    game: Game;

    followCamera:
        FollowCamera;

    playerEntity:
        pc.Entity;

    frogCollectionHUD:
        FrogCollectionHUD;

    timerHUD:
        TimerHUD;
}

let session:
    GameSession | null =
        null;

// --------------------------------------------------
// SESSION CLEANUP
// --------------------------------------------------

function destroySession(): void {
    if (!session) {
        return;
    }

    goalCelebration.hide();

    levelCompleteScreen.hide();

    session.game.destroy();

    session.timerHUD.destroy();

    session.frogCollectionHUD.destroy();

    session.playerEntity.destroy();

    levelManager.unload();

    session = null;

    camera.setPosition(
        0,
        18,
        14
    );

    camera.lookAt(
        0,
        0,
        -3
    );
}

// --------------------------------------------------
// LEVEL SELECT
// --------------------------------------------------

const levelSelect =
    new LevelSelect(
        LevelCatalog,

        entry => {
            if (!entry.definition) {
                return;
            }

            startLevel(
                entry
            );
        }
    );

// --------------------------------------------------
// START LEVEL
// --------------------------------------------------

function startLevel(
    entry: LevelCatalogEntry
): void {
    if (!entry.definition) {
        return;
    }

    destroySession();

    levelSelect.hide();
    settingsMenu.showButton();

    const level =
        levelManager.load(
            entry.definition
        );

    const startPosition =
        level.getStartPosition();

    const playerEntity =
        createBox(
            'Player',

            startPosition,

            new pc.Vec3(
                0.8,
                0.8,
                0.8
            ),

            neonGreen
        );

    const frog =
        new Player(
            app,
            playerEntity,
            startPosition
        );

    const frogCollectionHUD =
        new FrogCollectionHUD(
            level.getGoalColors()
        );

    const timerHUD =
        new TimerHUD();

    const followCamera =
        new FollowCamera(
            camera,
            frog.entity
        );

    const movingPlatformLanes = [
        ...level.riverLanes,
        ...level.turtleLanes,
    ];

    let game:
        Game;

    game =
        new Game(
            frog,

            level,

            level.trafficLanes,

            movingPlatformLanes,

            collected => {
                frogCollectionHUD
                    .update(
                        collected
                    );
            },

            result => {
                followCamera
                    .startGoalCelebration();

                /*
                 * Reveal the results after
                 * the camera pushes in.
                 */
                window.setTimeout(
                    () => {
                        /*
                         * Ignore an old callback
                         * if this session has
                         * already been destroyed.
                         */
                        if (
                            session?.game !==
                            game
                        ) {
                            return;
                        }

                        goalCelebration.show(
                            result,

                            () => {
                                goalCelebration
                                    .hide();

                                followCamera
                                    .endGoalCelebration();

                                window.setTimeout(
                                    () => {
                                        if (
                                            session?.game !==
                                            game
                                        ) {
                                            return;
                                        }

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
                 * Send the collected frog
                 * toward its HUD slot.
                 */
                window.setTimeout(
                    () => {
                        if (
                            session?.game !==
                            game
                        ) {
                            return;
                        }

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

                        collectedFrogAnimation
                            .fly({
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
                                        if (
                                            session?.game !==
                                            game
                                        ) {
                                            return;
                                        }

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
                levelCompleteScreen
                    .show(
                        {
                            levelName:
                                entry.name
                                    .toUpperCase(),

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
                             * Completing a level
                             * unlocks the next
                             * numbered level.
                             */
                            Progression.unlock(
                                entry.number +
                                    1
                            );

                            returnToLevelSelect();
                        }
                    );
            }
        );

    session = {
        level,

        frog,

        game,

        followCamera,

        playerEntity,

        frogCollectionHUD,

        timerHUD,
    };
}

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

const settingsMenu =
    new SettingsMenu(
        () => {
            session?.game.pause();
        },

        () => {
            session?.game.resume();
        },

        () => {
            settingsMenu.hide();

            returnToLevelSelect();
        }
    );

function returnToLevelSelect(): void {
    destroySession();

    settingsMenu.hideButton();

    levelSelect.show();
}

window.addEventListener(
    'keydown',
    event => {
        if (
            event.code ===
            'Escape'
        ) {
            settingsMenu.toggle();
        }
    }
);

// --------------------------------------------------
// TEST MODE
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

// --------------------------------------------------
// UPDATE
// --------------------------------------------------

app.on(
    'update',
    (dt: number) => {
        if (
            app.keyboard
                ?.wasPressed(
                    pc.KEY_T
                )
        ) {
            const testMode =
                Debug.toggleTestMode();

            testModeIndicator
                .style
                .display =
                testMode
                    ? 'block'
                    : 'none';
        }

        if (
            Debug.isTestMode() &&
            app.keyboard?.wasPressed(
                pc.KEY_G
            )
        ) {
            session?.game
                .debugCompleteLevel();
        }

        if (!session) {
            return;
        }

        if (
            session.game
                .isPlaying()
        ) {
            session.frog
                .update(
                    dt
                );

            levelManager.update(
                dt
            );

            session.game
                .update(
                    dt
                );
        }

        session.timerHUD
            .update(
                session.game
                    .getFrogTimeRemaining()
            );

        session.followCamera
            .update(
                dt
            );
    }
);

// --------------------------------------------------
// START
// --------------------------------------------------

app.start();

settingsMenu.hideButton();

levelSelect.show();