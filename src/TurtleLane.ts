import * as pc from 'playcanvas';

import {
    CELL_SIZE,
    MOVING_OBJECT_MIN_X,
    MOVING_OBJECT_MAX_X,
} from './core/Grid';

import type {
    MovingPlatformLane,
} from './river/MovingPlatformLane';

export interface TurtleLaneOptions {
    z: number;

    speed: number;

    direction:
        1 | -1;

    groupCount: number;

    spacing: number;

    // Number of turtles in each group.
    groupSize: number;

    // Does this lane periodically dive?
    canSubmerge: boolean;

    // Seconds turtles remain above water.
    surfaceDuration?: number;

    // Seconds turtles remain underwater.
    submergedDuration?: number;
}

type TurtleState =
    | 'surfaced'
    | 'warning'
    | 'diving'
    | 'submerged'
    | 'rising';

interface TurtleGroup {
    entity: pc.Entity;

    material:
        pc.StandardMaterial;

    timer: number;

    state: TurtleState;
}

export class TurtleLane
    implements MovingPlatformLane {

    public readonly speed: number;

    public readonly direction:
        1 | -1;

    public readonly z: number;

    private readonly groupSize:
        number;

    private readonly canSubmerge:
        boolean;

    private readonly surfaceDuration:
        number;

    private readonly submergedDuration:
        number;

    private readonly warningDuration =
        0.75;

    private readonly divingDuration =
        0.65;

    private readonly risingDuration =
        0.65;

    private readonly leftEdge =
        MOVING_OBJECT_MIN_X;

    private readonly rightEdge =
        MOVING_OBJECT_MAX_X;

    private groups:
        TurtleGroup[] = [];

    public get platforms():
        pc.Entity[] {
        return this.groups.map(
            group => group.entity
        );
    }

    constructor(
        private app: pc.Application,
        options: TurtleLaneOptions
    ) {
        this.speed =
            options.speed;

        this.direction =
            options.direction;

        this.z =
            options.z;

        this.groupSize =
            options.groupSize;

        this.canSubmerge =
            options.canSubmerge;

        this.surfaceDuration =
            options.surfaceDuration ??
            3;

        this.submergedDuration =
            options.submergedDuration ??
            1.25;

        for (
            let i = 0;
            i < options.groupCount;
            i++
        ) {
            const entity =
                new pc.Entity(
                    `Turtles-${options.z}-${i}`
                );

            entity.addComponent(
                'render',
                {
                    type: 'box',
                }
            );

            entity.setLocalScale(
                this.groupSize *
                    CELL_SIZE,
                0.28,
                0.75
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                new pc.Color(
                    0.05,
                    0.65,
                    0.35
                );

            material.emissive =
                new pc.Color(
                    0.02,
                    0.18,
                    0.08
                );

            material.update();

            if (entity.render) {
                entity.render.material =
                    material;
            }

            entity.setPosition(
                -7 +
                    i *
                        options.spacing,
                0.25,
                options.z
            );

            this.app.root.addChild(
                entity
            );

            this.groups.push({
                entity,

                material,

                timer:
                    i * 0.45,

                state: 'surfaced',
            });
        }
    }

    public update(
        dt: number
    ): void {
        for (
            const group
            of this.groups
        ) {
            this.updateMovement(
                group,
                dt
            );

            this.updateSubmerge(
                group,
                dt
            );
        }
    }

    private updateMovement(
        group: TurtleGroup,
        dt: number
    ): void {
        const position =
            group.entity
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
            x = this.leftEdge;
        }

        if (
            this.direction === -1 &&
            x < this.leftEdge
        ) {
            x = this.rightEdge;
        }

        group.entity.setPosition(
            x,
            position.y,
            position.z
        );
    }

    private updateSubmerge(
        group: TurtleGroup,
        dt: number
    ): void {
        if (!this.canSubmerge) {
            return;
        }

        group.timer += dt;

        const cycleLength =
            this.surfaceDuration +
            this.warningDuration +
            this.divingDuration +
            this.submergedDuration +
            this.risingDuration;

        const cyclePosition =
            group.timer %
            cycleLength;

        const warningStart =
            this.surfaceDuration;

        const divingStart =
            warningStart +
            this.warningDuration;

        const submergedStart =
            divingStart +
            this.divingDuration;

        const risingStart =
            submergedStart +
            this.submergedDuration;

        let state:
            TurtleState;

        if (
            cyclePosition <
            warningStart
        ) {
            state = 'surfaced';
        } else if (
            cyclePosition <
            divingStart
        ) {
            state = 'warning';
        } else if (
            cyclePosition <
            submergedStart
        ) {
            state = 'diving';
        } else if (
            cyclePosition <
            risingStart
        ) {
            state = 'submerged';
        } else {
            state = 'rising';
        }

        group.state = state;

        let targetY =
            0.25;

        let submergedAmount =
            0;

        if (
            state === 'warning'
        ) {
            /*
             * Small bob to warn the
             * player that this group
             * is about to dive.
             */
            const warningProgress =
                (
                    cyclePosition -
                    warningStart
                ) /
                this.warningDuration;

            targetY =
                0.25 -
                Math.sin(
                    warningProgress *
                    Math.PI *
                    4
                ) *
                    0.06;
        }

        if (
            state === 'diving'
        ) {
            const progress =
                (
                    cyclePosition -
                    divingStart
                ) /
                this.divingDuration;

            targetY =
                pc.math.lerp(
                    0.25,
                    -0.12,
                    progress
                );

            submergedAmount =
                progress;
        }

        if (
            state === 'submerged'
        ) {
            targetY =
                -0.12;

            submergedAmount =
                1;
        }

        if (
            state === 'rising'
        ) {
            const progress =
                (
                    cyclePosition -
                    risingStart
                ) /
                this.risingDuration;

            targetY =
                pc.math.lerp(
                    -0.12,
                    0.25,
                    progress
                );

            submergedAmount =
                1 - progress;
        }

        const position =
            group.entity
                .getPosition();

        group.entity.setPosition(
            position.x,
            targetY,
            position.z
        );

        this.updateUnderwaterVisual(
            group,
            submergedAmount
        );
    }

    private updateUnderwaterVisual(
        group: TurtleGroup,
        submergedAmount: number
    ): void {
        const amount =
            pc.math.clamp(
                submergedAmount,
                0,
                1
            );

        /*
         * Bright green above water.
         */
        const surfaceColor =
            new pc.Color(
                0.05,
                0.65,
                0.35
            );

        /*
         * Darker / bluer underwater.
         */
        const underwaterColor =
            new pc.Color(
                0.02,
                0.20,
                0.18
            );

        group.material.diffuse.set(
            pc.math.lerp(
                surfaceColor.r,
                underwaterColor.r,
                amount
            ),
            pc.math.lerp(
                surfaceColor.g,
                underwaterColor.g,
                amount
            ),
            pc.math.lerp(
                surfaceColor.b,
                underwaterColor.b,
                amount
            )
        );

        /*
         * Reduce the glow as the turtles
         * move underneath the water.
         */
        group.material.emissive.set(
            pc.math.lerp(
                0.02,
                0.005,
                amount
            ),
            pc.math.lerp(
                0.18,
                0.04,
                amount
            ),
            pc.math.lerp(
                0.08,
                0.04,
                amount
            )
        );

        /*
         * Keep them visible, but ghosted
         * beneath the water surface.
         */
        group.material.opacity =
            pc.math.lerp(
                1,
                0.38,
                amount
            );

        group.material.blendType =
            amount > 0.01
                ? pc.BLEND_NORMAL
                : pc.BLEND_NONE;

        group.material.depthWrite =
            amount < 0.99;

        group.material.update();
    }

    public isPlatformSafe(
        platform: pc.Entity
    ): boolean {
        const group =
            this.groups.find(
                item =>
                    item.entity ===
                    platform
            );

        if (!group) {
            return false;
        }

        return (
            group.state !==
            'submerged'
        );
    }

    public canLandOnPlatform(
        platform: pc.Entity
    ): boolean {
        const group =
            this.groups.find(
                item =>
                    item.entity ===
                    platform
            );

        if (!group) {
            return false;
        }

        return (
            group.state ===
                'surfaced' ||
            group.state ===
                'warning' ||
            group.state ===
                'rising'
        );
    }

    public getSlotX(
        platform: pc.Entity,
        slotIndex: number
    ): number {
        const platformX =
            platform
                .getPosition()
                .x;

        const width =
            this.groupSize *
            CELL_SIZE;

        const leftEdge =
            platformX -
            width / 2;

        return (
            leftEdge +
            slotIndex *
                CELL_SIZE +
            CELL_SIZE / 2
        );
    }

    public getClosestSlot(
        platform: pc.Entity,
        frogX: number
    ): number | null {
        const platformX =
            platform
                .getPosition()
                .x;

        const width =
            this.groupSize *
            CELL_SIZE;

        const leftEdge =
            platformX -
            width / 2;

        const localX =
            frogX -
            leftEdge;

        if (
            localX < 0 ||
            localX >= width
        ) {
            return null;
        }

        const slotIndex =
            Math.floor(
                localX /
                CELL_SIZE
            );

        if (
            !this.isValidSlot(
                slotIndex
            )
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
                this.groupSize
        );
    }
}