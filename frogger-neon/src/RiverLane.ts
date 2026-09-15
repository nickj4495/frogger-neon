import * as pc from 'playcanvas';

import {
    CELL_SIZE,
} from './core/Grid';

export interface RiverLaneOptions {
    z: number;
    speed: number;
    direction: 1 | -1;

    logCount: number;
    spacing: number;

    // Number of Frogger-sized slots.
    logSize: number;
}

export class RiverLane {
    public logs: pc.Entity[] = [];

    public readonly speed: number;
    public readonly direction: 1 | -1;

    public readonly z: number;
    public readonly logSize: number;

    private readonly leftEdge = -11;
    private readonly rightEdge = 11;

    constructor(
        private app: pc.Application,
        options: RiverLaneOptions
    ) {
        this.speed = options.speed;
        this.direction = options.direction;

        this.z = options.z;
        this.logSize = options.logSize;

        for (
            let i = 0;
            i < options.logCount;
            i++
        ) {
            const log = new pc.Entity(
                `Log-${options.z}-${i}`
            );

            log.addComponent('render', {
                type: 'box',
            });

            // 1 world unit = 1 slot.
            log.setLocalScale(
                options.logSize * CELL_SIZE,
                0.35,
                0.75
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                new pc.Color(
                    0.22,
                    0.07,
                    0.025
                );

            material.update();

            if (log.render) {
                log.render.material =
                    material;
            }

            log.setPosition(
                -7 +
                    i * options.spacing,
                0.25,
                options.z
            );

            this.app.root.addChild(log);

            this.logs.push(log);
        }
    }

    update(dt: number): void {
        for (const log of this.logs) {
            const position =
                log.getPosition();

            let x =
                position.x +
                this.speed *
                    this.direction *
                    dt;

            if (
                this.direction === 1 &&
                x > this.rightEdge
            ) {
                x = this.leftEdge;
            }

            if (
                this.direction === -1 &&
                x < this.leftEdge
            ) {
                x = this.rightEdge;
            }

            log.setPosition(
                x,
                position.y,
                position.z
            );
        }
    }

    /**
     * World X coordinate of the center
     * of a particular log slot.
     *
     * 3-unit log:
     *
     * [ 0 ][ 1 ][ 2 ]
     */
    public getSlotX(
        log: pc.Entity,
        slotIndex: number
    ): number {
        const logX =
            log.getPosition().x;

        const leftEdge =
            logX -
            this.logSize / 2;

        return (
            leftEdge +
            slotIndex * CELL_SIZE +
            CELL_SIZE / 2
        );
    }

    /**
     * Determines which slot contains
     * a given world X position.
     */
    public getClosestSlot(
        log: pc.Entity,
        frogX: number
    ): number | null {
        const logX =
            log.getPosition().x;

        const leftEdge =
            logX -
            this.logSize / 2;

        const localX =
            frogX - leftEdge;

        if (
            localX < 0 ||
            localX >= this.logSize
        ) {
            return null;
        }

        const slotIndex =
            Math.floor(localX);

        if (
            slotIndex < 0 ||
            slotIndex >=
                this.logSize
        ) {
            return null;
        }

        return slotIndex;
    }

    public isValidSlot(
        slotIndex: number
    ): boolean {
        return (
            slotIndex >= 0 &&
            slotIndex <
                this.logSize
        );
    }
}