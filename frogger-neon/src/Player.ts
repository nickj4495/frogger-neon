import * as pc from 'playcanvas';

import {
    CELL_SIZE,
    PLAYER_START_X,
    PLAYER_START_Z,
    snapToGrid,
    clampToGrid,
} from './core/Grid';

export interface PlayerMove {
    x: number;
    z: number;
}

export class Player {
    public entity: pc.Entity;

    private readonly startPosition =
        new pc.Vec3(
            PLAYER_START_X,
            0.5,
            PLAYER_START_Z
        );

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
        entity: pc.Entity
    ) {
        this.entity = entity;

        this.entity.setPosition(
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

        if (!keyboard) return;

        let x = 0;
        let z = 0;

        if (
            keyboard.wasPressed(pc.KEY_W) ||
            keyboard.wasPressed(pc.KEY_UP)
        ) {
            z = -CELL_SIZE;
        } else if (
            keyboard.wasPressed(pc.KEY_S) ||
            keyboard.wasPressed(pc.KEY_DOWN)
        ) {
            z = CELL_SIZE;
        } else if (
            keyboard.wasPressed(pc.KEY_A) ||
            keyboard.wasPressed(pc.KEY_LEFT)
        ) {
            x = -CELL_SIZE;
        } else if (
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
            if (this.platformVelocityX !== 0) {
                // On a moving platform:
                // move exactly one slot relative
                // to the platform.
                this.moveTarget.x += x;
            } else {
                // On solid ground:
                // stay aligned to the world grid.
                this.moveTarget.x =
                    snapToGrid(
                        this.moveStart.x
                    ) + x;
            }
        }

        // --------------------------------------------------
        // FORWARD / BACKWARD
        // --------------------------------------------------

        if (z !== 0) {
            this.moveTarget.z =
                Math.round(
                    this.moveStart.z
                ) + z;
        }

        // Don't allow movement outside the
        // playable board on normal ground.
        if (this.platformVelocityX === 0) {
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
        // If Frogger started this hop while
        // riding a log, the entire hop moves
        // along with the log.
        if (this.platformVelocityX !== 0) {
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
            Math.sin(t * Math.PI) *
            0.55;

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

            // Tell Game.ts exactly what
            // movement just finished.
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
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }

    public isCurrentlyMoving():
        boolean {
        return this.isMoving;
    }
}