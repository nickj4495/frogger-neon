import * as pc from 'playcanvas';

import { Player } from './Player';
import type { PlayerMove } from './Player';

import { TrafficLane } from './TrafficLane';
import { RiverLane } from './RiverLane';

export class Game {
    private lives = 3;
    private score = 0;

    private furthestZ = 5;

    private isDead = false;

    // --------------------------------------------------
    // RIVER STATE
    // --------------------------------------------------

    private ridingLog:
        pc.Entity | null = null;

    private ridingLane:
        RiverLane | null = null;

    private ridingSlot:
        number | null = null;

    // --------------------------------------------------
    // HUD
    // --------------------------------------------------

    private hud: HTMLDivElement;
    private message: HTMLDivElement;

    constructor(
        private player: Player,
        private trafficLanes:
            TrafficLane[],
        private riverLanes:
            RiverLane[]
    ) {
        this.hud =
            this.createHUD();

        this.message =
            this.createMessage();

        this.updateHUD();
    }

    update(): void {
        if (this.isDead) return;

        const completedMove =
            this.player.consumeCompletedMove();

        if (completedMove) {
            this.handleCompletedMove(
                completedMove
            );
        }

        this.checkVehicleCollisions();

        if (this.isDead) return;

        this.checkRiver();

        if (this.isDead) return;

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
            !this.ridingLog ||
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
            this.clearRidingLog();

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
            this.clearRidingLog();
        }
    }

    // --------------------------------------------------
    // RIVER
    // --------------------------------------------------

    private checkRiver(): void {
        const frogPosition =
            this.player.getPosition();

        const isInRiver =
            frogPosition.z <= -6 &&
            frogPosition.z >= -8;

        // Frog isn't in a river row.
        if (!isInRiver) {
            if (
                !this.player
                    .isCurrentlyMoving()
            ) {
                this.clearRidingLog();
            }

            return;
        }

        // Don't perform landing checks
        // in the middle of a hop.
        if (
            this.player
                .isCurrentlyMoving()
        ) {
            return;
        }

        // ----------------------------------------------
        // ALREADY RIDING A KNOWN SLOT
        // ----------------------------------------------

        if (
            this.ridingLog &&
            this.ridingLane &&
            this.ridingSlot !== null
        ) {
            const slotX =
                this.ridingLane
                    .getSlotX(
                        this.ridingLog,
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
                slotX < -7.5 ||
                slotX > 7.5
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
                const log
                of lane.logs
            ) {
                const slot =
                    lane.getClosestSlot(
                        log,
                        frogPosition.x
                    );

                if (slot === null) {
                    continue;
                }

                this.ridingLog =
                    log;

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
                        log,
                        slot
                    );

                // Snap precisely to the
                // center of the slot.
                this.player.entity
                    .setPosition(
                        slotX,
                        frogPosition.y,
                        lane.z
                    );

                return;
            }

            // We're in a river lane,
            // but no platform contains us.
            this.killPlayer(
                'SPLASH!'
            );

            return;
        }
    }

    private clearRidingLog():
        void {
        this.ridingLog = null;
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
            this.player
                .isCurrentlyMoving()
        ) {
            return;
        }

        const frogPosition =
            this.player.getPosition();

        if (
            frogPosition.z <= -10
        ) {
            this.reachGoal();
        }
    }

    private reachGoal(): void {
        if (this.isDead) return;

        this.isDead = true;

        this.clearRidingLog();

        this.score += 100;

        this.updateHUD();

        this.showMessage('+100');

        window.setTimeout(() => {
            this.furthestZ = 5;

            this.player.reset();

            this.hideMessage();

            this.isDead = false;
        }, 650);
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
        if (this.isDead) return;

        this.isDead = true;

        this.clearRidingLog();

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

            this.furthestZ = 5;

            this.player.reset();

            this.player.entity.enabled =
                true;

            this.hideMessage();

            this.isDead = false;
        }, 900);
    }

    private gameOver(): void {
        this.showMessage(
            'GAME OVER'
        );

        window.setTimeout(() => {
            this.lives = 3;
            this.score = 0;
            this.furthestZ = 5;

            this.clearRidingLog();

            this.player.reset();

            this.player.entity.enabled =
                true;

            this.updateHUD();

            this.hideMessage();

            this.isDead = false;
        }, 1800);
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
}