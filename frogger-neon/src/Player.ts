import * as pc from 'playcanvas';

export class Player {
    public entity: pc.Entity;

    private startPosition = new pc.Vec3(0, 0.5, 5);

    private isMoving = false;

    private moveStart = new pc.Vec3();
    private moveTarget = new pc.Vec3();

    private moveProgress = 0;
    private readonly moveDuration = 0.14;
    private readonly gridSize = 1;

    constructor(
        private app: pc.Application,
        entity: pc.Entity
    ) {
        this.entity = entity;

        this.entity.setPosition(this.startPosition);
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
            z = -this.gridSize;
        } else if (
            keyboard.wasPressed(pc.KEY_S) ||
            keyboard.wasPressed(pc.KEY_DOWN)
        ) {
            z = this.gridSize;
        } else if (
            keyboard.wasPressed(pc.KEY_A) ||
            keyboard.wasPressed(pc.KEY_LEFT)
        ) {
            x = -this.gridSize;
        } else if (
            keyboard.wasPressed(pc.KEY_D) ||
            keyboard.wasPressed(pc.KEY_RIGHT)
        ) {
            x = this.gridSize;
        }

        if (x !== 0 || z !== 0) {
            this.startMove(x, z);
        }
    }

    private startMove(x: number, z: number): void {
        this.moveStart.copy(this.entity.getPosition());
        this.moveTarget.copy(this.moveStart);

        this.moveTarget.x += x;
        this.moveTarget.z += z;

        // Keep player inside the board horizontally.
        this.moveTarget.x = pc.math.clamp(
            this.moveTarget.x,
            -7,
            7
        );

        this.moveProgress = 0;
        this.isMoving = true;
    }

    private animateMovement(dt: number): void {
        this.moveProgress += dt / this.moveDuration;

        const t = Math.min(this.moveProgress, 1);

        // Smooth horizontal movement.
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

        // Parabolic hop.
        const hopHeight = Math.sin(t * Math.PI) * 0.55;

        const y = pc.math.lerp(
            this.moveStart.y,
            this.moveTarget.y,
            t
        ) + hopHeight;

        this.entity.setPosition(x, y, z);

        if (t >= 1) {
            this.entity.setPosition(this.moveTarget);
            this.isMoving = false;
        }
    }

    reset(): void {
        this.isMoving = false;
        this.moveProgress = 0;

        this.entity.setPosition(this.startPosition);
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }

    public isCurrentlyMoving(): boolean {
        return this.isMoving;
    }
}