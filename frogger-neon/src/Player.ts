import * as pc from 'playcanvas';

import {
    CELL_SIZE,
    snapToGrid,
    clampToGrid,
} from './core/Grid';

export interface PlayerMove {
    x: number;
    z: number;
}

export class Player {
    private isMoving = false;

    private platformVelocityX = 0;

    private moveStart = new pc.Vec3();
    private moveTarget = new pc.Vec3();

    private moveProgress = 0;

    private readonly moveDuration = 0.14;

    private currentMove: PlayerMove = {
        x: 0,
        z: 0,
    };

    private completedMove: PlayerMove | null = null;

    constructor(
        private app: pc.Application,
        public entity: pc.Entity,
        private startPosition: pc.Vec3
    ) {
        // Keep our own copy so the Player's
        // spawn point cannot accidentally be
        // changed from outside this class.
        this.startPosition =
            startPosition.clone();

        this.entity.setPosition(
            this.startPosition
        );

        this.moveStart.copy(
            this.startPosition
        );

        this.moveTarget.copy(
            this.startPosition
        );
    }

    update(dt: number): void {
        if (this.isMoving) {
            this.animateMovement(dt);
            return;
        }

        this.handleInput();
    }

    private handleInput(): void {
        const keyboard = this.app.keyboard;

        if (!keyboard) {
            return;
        }

        let x = 0;
        let z = 0;

        // Forward
        if (
            keyboard.wasPressed(pc.KEY_W) ||
            keyboard.wasPressed(pc.KEY_UP)
        ) {
            z = -CELL_SIZE;
        }

        // Backward
        else if (
            keyboard.wasPressed(pc.KEY_S) ||
            keyboard.wasPressed(pc.KEY_DOWN)
        ) {
            z = CELL_SIZE;
        }

        // Screen-left.
        //
        // Our current camera orientation means
        // screen-left is positive world X.
        else if (
            keyboard.wasPressed(pc.KEY_A) ||
            keyboard.wasPressed(pc.KEY_LEFT)
        ) {
            x = -CELL_SIZE;
        }

        // Screen-right.
        //
        // Our current camera orientation means
        // screen-right is negative world X.
        else if (
            keyboard.wasPressed(pc.KEY_D) ||
            keyboard.wasPressed(pc.KEY_RIGHT)
        ) {
            x = CELL_SIZE;
        }

        if (x !== 0 || z !== 0) {
            this.startMove(x, z);
        }
    }

    private startMove(
        x: number,
        z: number
    ): void {
        this.moveStart.copy(
            this.entity.getPosition()
        );

        this.moveTarget.copy(
            this.moveStart
        );

        this.currentMove = {
            x,
            z,
        };

        // --------------------------------------------------
        // HORIZONTAL MOVEMENT
        // --------------------------------------------------

        if (x !== 0) {
            if (
                this.platformVelocityX !== 0
            ) {
                // While riding a moving platform,
                // move exactly one logical slot
                // relative to that platform.
                this.moveTarget.x += x;
            } else {
                // On normal ground, Frogger stays
                // aligned to the universal grid.
                this.moveTarget.x =
                    snapToGrid(
                        this.moveStart.x
                    ) + x;
            }
        }

        // --------------------------------------------------
        // FORWARD / BACKWARD MOVEMENT
        // --------------------------------------------------

        if (z !== 0) {
            this.moveTarget.z =
                snapToGrid(
                    this.moveStart.z
                ) + z;
        }

        // On normal ground Frogger cannot leave
        // the playable horizontal board.
        if (
            this.platformVelocityX === 0
        ) {
            this.moveTarget.x =
                clampToGrid(
                    this.moveTarget.x
                );
        }

        this.moveProgress = 0;
        this.isMoving = true;
    }

    private animateMovement(
        dt: number
    ): void {
        // If this hop began while Frogger was
        // riding a moving platform, move both
        // ends of the hop along with it.
        if (
            this.platformVelocityX !== 0
        ) {
            const platformMovement =
                this.platformVelocityX * dt;

            this.moveStart.x +=
                platformMovement;

            this.moveTarget.x +=
                platformMovement;
        }

        this.moveProgress +=
            dt / this.moveDuration;

        const t = Math.min(
            this.moveProgress,
            1
        );

        const x = pc.math.lerp(
            this.moveStart.x,
            this.moveTarget.x,
            t
        );

        const z = pc.math.lerp(
            this.moveStart.z,
            this.moveTarget.z,
            t
        );

        const hopHeight =
            Math.sin(
                t * Math.PI
            ) * 0.55;

        const y =
            pc.math.lerp(
                this.moveStart.y,
                this.moveTarget.y,
                t
            ) +
            hopHeight;

        this.entity.setPosition(
            x,
            y,
            z
        );

        if (t >= 1) {
            this.entity.setPosition(
                this.moveTarget
            );

            this.isMoving = false;

            // Game.ts consumes this once so it
            // knows exactly which logical hop
            // Frogger just completed.
            this.completedMove = {
                ...this.currentMove,
            };

            this.currentMove = {
                x: 0,
                z: 0,
            };
        }
    }

    public consumeCompletedMove():
        PlayerMove | null {
        const move =
            this.completedMove;

        this.completedMove = null;

        return move;
    }

    public setPlatformVelocityX(
        velocity: number
    ): void {
        this.platformVelocityX =
            velocity;
    }

    public clearPlatformVelocity():
        void {
        this.platformVelocityX = 0;
    }

    public reset(): void {
        this.isMoving = false;

        this.moveProgress = 0;

        this.platformVelocityX = 0;

        this.completedMove = null;

        this.currentMove = {
            x: 0,
            z: 0,
        };

        this.entity.setPosition(
            this.startPosition
        );

        // Reset these as well so no stale
        // movement data survives a death.
        this.moveStart.copy(
            this.startPosition
        );

        this.moveTarget.copy(
            this.startPosition
        );
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }

    public isCurrentlyMoving():
        boolean {
        return this.isMoving;
    }

    public snapToPosition(
        x: number,
        z: number
    ): void {
        const position =
            this.entity.getPosition();

        this.entity.setPosition(
            x,
            position.y,
            z
        );

        this.moveStart.copy(
            this.entity.getPosition()
        );

        this.moveTarget.copy(
            this.entity.getPosition()
        );
    }
}