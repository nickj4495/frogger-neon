import * as pc from 'playcanvas';

import {
    CELL_SIZE,
    MOVING_OBJECT_MIN_X,
    MOVING_OBJECT_MAX_X,
} from './core/Grid';

import type {
    MovingPlatformLane,
} from './river/MovingPlatformLane';

export interface RiverLaneOptions {
    z: number;
    speed: number;
    direction: 1 | -1;

    logCount: number;
    spacing: number;

    // Default number of Frogger-sized slots.
    logSize: number;
}

interface LogData {
    entity: pc.Entity;

    // Individual logical size of this log.
    size: number;
}

export class RiverLane
    implements MovingPlatformLane {
    private logsData:
        LogData[] = [];

    public get logs():
        pc.Entity[] {
        return this.logsData.map(
            log => log.entity
        );
    }

    public get platforms():
        pc.Entity[] {
        return this.logs;
    }

    public readonly speed: number;

    public readonly direction:
        1 | -1;

    public readonly z: number;

    public readonly logSize: number;

    private readonly leftEdge =
        MOVING_OBJECT_MIN_X;

    private readonly rightEdge =
        MOVING_OBJECT_MAX_X;

    constructor(
        private app: pc.Application,
        options: RiverLaneOptions
    ) {
        this.speed =
            options.speed;

        this.direction =
            options.direction;

        this.z =
            options.z;

        this.logSize =
            options.logSize;

        for (
            let i = 0;
            i < options.logCount;
            i++
        ) {
            /*
             * 20% chance that this individual
             * log is a short 2-slot variant.
             */
            const size =
                Math.random() < 0.2
                    ? 2
                    : options.logSize;

            const log =
                new pc.Entity(
                    `Log-${options.z}-${i}`
                );

            log.addComponent(
                'render',
                {
                    type: 'box',
                }
            );

            log.setLocalScale(
                size * CELL_SIZE,
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
                    i *
                        options.spacing,
                0.25,
                options.z
            );

            this.app.root.addChild(
                log
            );

            this.logsData.push({
                entity: log,
                size,
            });
        }
    }

    update(dt: number): void {
        for (
            const log
            of this.logsData
        ) {
            const position =
                log.entity
                    .getPosition();

            let x =
                position.x +
                this.speed *
                    this.direction *
                    dt;

            if (
                this.direction === 1 &&
                x > this.rightEdge
            ) {
                x =
                    this.leftEdge;
            }

            if (
                this.direction === -1 &&
                x < this.leftEdge
            ) {
                x =
                    this.rightEdge;
            }

            log.entity.setPosition(
                x,
                position.y,
                position.z
            );
        }
    }

    private getLogSize(
        entity: pc.Entity
    ): number | null {
        const log =
            this.logsData.find(
                item =>
                    item.entity ===
                    entity
            );

        return (
            log?.size ??
            null
        );
    }

    public getSlotX(
        log: pc.Entity,
        slotIndex: number
    ): number {
        const logX =
            log.getPosition().x;

        const size =
            this.getLogSize(
                log
            );

        if (size === null) {
            return logX;
        }

        const logWidth =
            size * CELL_SIZE;

        const leftEdge =
            logX -
            logWidth / 2;

        return (
            leftEdge +
            slotIndex *
                CELL_SIZE +
            CELL_SIZE / 2
        );
    }

    public getClosestSlot(
        log: pc.Entity,
        frogX: number
    ): number | null {
        const logX =
            log.getPosition().x;

        const size =
            this.getLogSize(
                log
            );

        if (size === null) {
            return null;
        }

        const logWidth =
            size * CELL_SIZE;

        const leftEdge =
            logX -
            logWidth / 2;

        const localX =
            frogX -
            leftEdge;

        if (
            localX < 0 ||
            localX >= logWidth
        ) {
            return null;
        }

        const slotIndex =
            Math.floor(
                localX /
                CELL_SIZE
            );

        if (
            slotIndex < 0 ||
            slotIndex >= size
        ) {
            return null;
        }

        return slotIndex;
    }

    public isValidSlot(
        slotIndex: number
    ): boolean {
        /*
         * This method cannot know which
         * individual log is being checked.
         *
         * Individual size validation happens
         * in getClosestSlot().
         */
        return (
            slotIndex >= 0 &&
            slotIndex <
                this.logSize
        );
    }

    public isPlatformSafe(
        _platform: pc.Entity
    ): boolean {
        return true;
    }

    public canLandOnPlatform(
        _platform: pc.Entity
    ): boolean {
        return true;
    }
}