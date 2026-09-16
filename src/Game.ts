import * as pc from 'playcanvas';

import type { GameState } from './core/GameState';
import {
    CELL_SIZE,
    GRID_MIN_X,
    GRID_MAX_X,
    isPlayerInsideBounds
} from './core/Grid';
import {
    Debug,
} from './core/Debug';

import type {
    MovingPlatformLane,
} from './river/MovingPlatformLane';

import { Level } from './levels/Level';

import type {
    GoalState,
} from './levels/Level';

import { Player } from './Player';
import type { PlayerMove } from './Player';
import { TrafficLane } from './TrafficLane';
import { RiverLane } from './RiverLane';

export interface GoalResult {
    goalIndex: number;
    goalColor: string;

    time: number;
    timeBonus: number;
    score: number;
}

export interface LevelCompleteResult {
    time: number;
    lives: number;
    score: number;
}

export class Game {
    private lives = 3;
    private score = 0;

    private furthestZ: number;

    private state: GameState = 'playing';

    private readonly frogTimeLimit =
        30;

    private frogTimeRemaining =
        this.frogTimeLimit;

    private levelElapsedTime =
        0;

    private updateTimer(
        dt: number
    ): void {
        if (
            Debug.isTestMode()
        ) {
            return;
        }

        this.frogTimeRemaining -=
            dt;

        if (
            this.frogTimeRemaining >
            0
        ) {
            return;
        }

        this.frogTimeRemaining =
            0;

        this.killPlayer(
            'TIME OUT!'
        );
    }

    public getFrogTimeRemaining():
        number {
        return Math.max(
            0,
            this.frogTimeRemaining
        );
    }

    public getFrogTimeElapsed():
        number {
        return (
            this.frogTimeLimit -
            this.getFrogTimeRemaining()
        );
    }

    public getLevelElapsedTime():
        number {
        return this.levelElapsedTime;
    }

    public getLives():
        number {
        return this.lives;
    }

    public getScore():
        number {
        return this.score;
    }

    private resetFrogTimer():
        void {
        this.frogTimeRemaining =
            this.frogTimeLimit;
    }

    // --------------------------------------------------
    // RIVER STATE
    // --------------------------------------------------

    private ridingPlatform:
        pc.Entity | null = null;

    private ridingLane:
        MovingPlatformLane | null =
            null;

    private ridingSlot:
        number | null = null;

    // --------------------------------------------------
    // HUD
    // --------------------------------------------------

    private hud: HTMLDivElement;
    private message: HTMLDivElement;

    constructor(
        private player: Player,
        private level: Level,
        private trafficLanes:
            TrafficLane[],
        private riverLanes:
            MovingPlatformLane[],

        private onGoalsChanged?:
            (
                collected:
                    boolean[]
            ) => void,

        private onGoalCelebration?:
            (
                result:
                    GoalResult
            ) => void,

        private onLevelComplete?:
            (
                result:
                    LevelCompleteResult
            ) => void
    ) {
        this.hud =
            this.createHUD();

        this.message =
            this.createMessage();

        this.updateHUD();
    }

    update(
        dt: number
    ): void {
        if (this.state !== 'playing') {
            return;
        }

        if (
            !Debug.isTestMode()
        ) {
            this.levelElapsedTime +=
                dt;
        }

        this.updateTimer(
            dt
        );

        if (this.state !== 'playing') {
            return;
        }

        const completedMove =
            this.player.consumeCompletedMove();

        if (completedMove) {
            this.handleCompletedMove(
                completedMove
            );
        }

        this.checkVehicleCollisions();

        if (this.state !== 'playing') {
            return;
        }

        this.checkRiver();

        if (this.state !== 'playing') {
            return;
        }

        this.checkForwardProgress();
        this.checkGoal();
    }

    // --------------------------------------------------
    // MOVEMENT RESULT
    // --------------------------------------------------

    private handleCompletedMove(
        move: PlayerMove
    ): void {
        if (
            !this.ridingPlatform ||
            !this.ridingLane ||
            this.ridingSlot === null
        ) {
            return;
        }

        // ----------------------------------------------
        // LEFT / RIGHT WHILE ON A LOG
        // ----------------------------------------------

        if (move.x !== 0) {
            const newSlot =
                this.ridingSlot +
                move.x;

            // Still on the same log.
            if (
                this.ridingLane.isValidSlot(
                    newSlot
                )
            ) {
                this.ridingSlot =
                    newSlot;

                return;
            }

            // Frogger jumped beyond the end
            // of the log.
            //
            // He's no longer attached to it.
            this.clearRidingPlatform();

            return;
        }

        // ----------------------------------------------
        // FORWARD / BACKWARD FROM A LOG
        // ----------------------------------------------

        if (move.z !== 0) {
            // We left this log.
            //
            // checkRiver() will determine
            // whether we landed on another
            // log or directly in the water.
            this.clearRidingPlatform();
        }
    }

    // --------------------------------------------------
    // RIVER
    // --------------------------------------------------

    private checkRiver(): void {
        const frogPosition =
            this.player.getPosition();

        const isInRiver =
            this.level.isWaterAt(
                frogPosition.z
            );

        // Frog isn't in a river row.
        if (!isInRiver) {
            if (
                !this.player
                    .isCurrentlyMoving()
            ) {
                this.clearRidingPlatform();
            }

            return;
        }

        // Don't resolve landings
        // during a hop.
        if (
            this.player
                .isCurrentlyMoving()
        ) {
            return;
        }

        // ----------------------------------------------
        // ALREADY RIDING A KNOWN PLATFORM SLOT
        // ----------------------------------------------

        if (
            this.ridingPlatform &&
            this.ridingLane &&
            this.ridingSlot !== null
        ) {
            // A platform can become unsafe
            // while Frogger is riding it.
            //
            // Logs always return true.
            // Diving turtles will not.
            if (
                !this.ridingLane
                    .isPlatformSafe(
                        this.ridingPlatform
                    )
            ) {
                this.clearRidingPlatform();

                this.killPlayer(
                    'SPLASH!'
                );

                return;
            }

            const slotX =
                this.ridingLane
                    .getSlotX(
                        this.ridingPlatform,
                        this.ridingSlot
                    );

            this.player
                .setPlatformVelocityX(
                    this.ridingLane.speed *
                        this.ridingLane
                            .direction
                );

            this.player.entity
                .setPosition(
                    slotX,
                    frogPosition.y,
                    this.ridingLane.z
                );

            if (
                !isPlayerInsideBounds(
                    slotX
                )
            ) {
                this.killPlayer(
                    'SPLASH!'
                );
            }

            return;
        }

        // ----------------------------------------------
        // JUST LANDED IN THE RIVER
        // ----------------------------------------------

        for (
            const lane
            of this.riverLanes
        ) {
            if (
                Math.abs(
                    frogPosition.z -
                        lane.z
                ) > 0.1
            ) {
                continue;
            }

            for (
                const platform
                of lane.platforms
            ) {
                if (
                    !lane.canLandOnPlatform(
                        platform
                    )
                ) {
                    continue;
                }

                const slot =
                    lane.getClosestSlot(
                        platform,
                        frogPosition.x
                    );

                if (slot === null) {
                    continue;
                }

                this.ridingPlatform =
                    platform;

                this.ridingLane =
                    lane;

                this.ridingSlot =
                    slot;

                this.player
                    .setPlatformVelocityX(
                        lane.speed *
                            lane.direction
                    );

                const slotX =
                    lane.getSlotX(
                        platform,
                        slot
                    );

                // Resolve landing to the
                // exact logical slot center.
                this.player.entity
                    .setPosition(
                        slotX,
                        frogPosition.y,
                        lane.z
                    );

                return;
            }

            // Frog landed in water with
            // no safe platform underneath.
            this.killPlayer(
                'SPLASH!'
            );

            return;
        }
    }

    private clearRidingPlatform():
        void {
        this.ridingPlatform = null;
        this.ridingLane = null;
        this.ridingSlot = null;

        this.player
            .clearPlatformVelocity();
    }

    // --------------------------------------------------
    // SCORE
    // --------------------------------------------------

    private checkForwardProgress():
        void {
        const frogPosition =
            this.player.getPosition();

        // Don't score fractional positions
        // during the middle of a hop.
        if (
            this.player
                .isCurrentlyMoving()
        ) {
            return;
        }

        const row =
            Math.round(
                frogPosition.z
            );

        if (row < this.furthestZ) {
            this.furthestZ = row;

            this.score += 10;

            this.updateHUD();
        }
    }

    // --------------------------------------------------
    // GOAL
    // --------------------------------------------------

    private checkGoal(): void {
        if (
            this.player.isCurrentlyMoving()
        ) {
            return;
        }

        const frogPosition =
            this.player.getPosition();

        if (
            !this.level.isGoalAt(
                frogPosition.z
            )
        ) {
            return;
        }

        const goal =
            this.level.getGoalAt(
                frogPosition.x,
                frogPosition.z
            );

        // Reached the goal row but
        // missed every valid goal.
        if (!goal) {
            this.killPlayer();
            return;
        }

        // This goal has already
        // been collected.
        if (goal.collected) {
            this.killPlayer();
            return;
        }

        // Resolve the landing to the exact
        // logical center of the goal.
        this.player.snapToPosition(
            goal.x,
            goal.z
        );

        this.collectGoal(goal);
    }

    private completeLevel(): void {
        this.state =
            'levelComplete';

        this.clearRidingPlatform();

        this.score += 500;

        this.updateHUD();

        this.onLevelComplete?.({
            time:
                this.levelElapsedTime,

            lives:
                this.lives,

            score:
                this.score,
        });
    }

    private collectGoal(
        goal: GoalState
    ): void {
        if (
            !this.level.collectGoal(
                goal
            )
        ) {
            return;
        }

        /*
         * Immediately freeze gameplay.
         *
         * Every goal — including the fifth —
         * enters the same celebration state.
         */
        this.state =
            'goalCelebration';

        this.clearRidingPlatform();

        const goalIndex =
            this.level
                .getGoalIndex(
                    goal
                );

        const goalColor =
            this.level
                .getGoalColors()[
                    goalIndex
                ];

        const completionTime =
            this.getFrogTimeElapsed();

        const remainingTime =
            this.getFrogTimeRemaining();

        const timeBonus =
            Math.floor(
                remainingTime *
                10
            );

        this.score +=
            100 +
            timeBonus;

        this.updateHUD();

        this.onGoalCelebration?.({
            goalIndex,

            goalColor,

            time:
                completionTime,

            timeBonus,

            score:
                this.score,
        });
    }

    public continueAfterGoal():
        void {
        if (
            this.state !==
            'goalCelebration'
        ) {
            return;
        }

        /*
         * Frog #5 has completed the
         * level. Do NOT respawn.
         */
        if (
            this.level
                .areAllGoalsCollected()
        ) {
            this.completeLevel();

            return;
        }

        /*
         * Normal goals 1–4:
         * start another crossing.
         */
        this.player.reset();

        this.resetFrogTimer();

        this.furthestZ =
            this.level
                .definition
                .startZ;

        this.state =
            'playing';
    }

    // --------------------------------------------------
    // TRAFFIC
    // --------------------------------------------------

    private checkVehicleCollisions():
        void {
        if (
            this.player
                .isCurrentlyMoving()
        ) {
            return;
        }

        const frogPosition =
            this.player.getPosition();

        for (
            const lane
            of this.trafficLanes
        ) {
            // Only test the row Frogger
            // is actually standing on.
            if (
                Math.abs(
                    frogPosition.z -
                        lane.z
                ) > 0.1
            ) {
                continue;
            }

            for (
                const vehicle
                of lane.vehicles
            ) {
                if (
                    lane.containsPlayer(
                        vehicle,
                        frogPosition.x
                    )
                ) {
                    this.killPlayer();

                    return;
                }
            }
        }
    }

    // --------------------------------------------------
    // DEATH
    // --------------------------------------------------

    private killPlayer(
        message = 'SPLAT!'
    ): void {

        if (
            Debug.isTestMode()
        ) {
            return;
        }

        if (this.state !== 'playing') {
            return;
        }

        this.state = 'dead';

        this.clearRidingPlatform();

        this.lives--;

        this.updateHUD();

        this.showMessage(message);

        this.player.entity.enabled =
            false;

        window.setTimeout(() => {
            if (this.lives <= 0) {
                this.gameOver();

                return;
            }

            this.furthestZ =
                this.level.definition.startZ;

            this.player.reset();
            this.resetFrogTimer();

            this.player.entity.enabled =
                true;

            this.hideMessage();

            this.state = 'playing';
        }, 900);
    }

    private gameOver(): void {

        this.state = 'gameOver';

        this.showMessage(
            'GAME OVER'
        );

        window.setTimeout(() => {
            this.lives = 3;
            this.score = 0;
            this.furthestZ =
                this.level.definition.startZ;

            this.clearRidingPlatform();

            this.player.reset();
            this.resetFrogTimer();

            this.player.entity.enabled =
                true;

            this.updateHUD();

            this.hideMessage();

            this.state = 'playing';
        }, 1800);
    }

    public pause(): void {
        if (this.state === 'playing') {
            this.state = 'paused';
        }
    }

    public resume(): void {
        if (this.state === 'paused') {
            this.state = 'playing';
        }
    }

    public togglePause(): void {
        if (this.state === 'playing') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    public isPlaying(): boolean {
        return this.state === 'playing';
    }

    public isPaused(): boolean {
        return this.state === 'paused';
    }

    public getState(): GameState {
        return this.state;
    }

    // --------------------------------------------------
    // HUD
    // --------------------------------------------------

    private createHUD():
        HTMLDivElement {
        const hud =
            document.createElement(
                'div'
            );

        hud.id = 'game-hud';

        document.body.appendChild(
            hud
        );

        return hud;
    }

    private createMessage():
        HTMLDivElement {
        const message =
            document.createElement(
                'div'
            );

        message.id =
            'game-message';

        document.body.appendChild(
            message
        );

        return message;
    }

    private updateHUD(): void {
        this.hud.innerHTML = `
            <div class="hud-title">
                NEON CROSSING
            </div>

            <div class="hud-stats">
                <span>
                    SCORE ${this.score
                        .toString()
                        .padStart(6, '0')}
                </span>

                <span>
                    LIVES ${'●'.repeat(
                        this.lives
                    )}
                </span>
            </div>
        `;
    }

    private showMessage(
        text: string
    ): void {
        this.message.textContent =
            text;

        this.message.classList.add(
            'visible'
        );
    }

    private hideMessage(): void {
        this.message.classList.remove(
            'visible'
        );
    }

    public destroy(): void {
        this.clearRidingPlatform();

        this.hud.remove();

        this.message.remove();
    }
}