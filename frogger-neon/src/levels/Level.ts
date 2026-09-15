import * as pc from 'playcanvas';

import { TrafficLane } from '../TrafficLane';
import { RiverLane } from '../RiverLane';

import {
    CELL_SIZE,
    GRID_WIDTH,
} from '../core/Grid';

import type {
    LevelDefinition,
    GroundType,
} from './LevelDefinition';

export class Level {
    public trafficLanes:
        TrafficLane[] = [];

    public riverLanes:
        RiverLane[] = [];

    private entities:
        pc.Entity[] = [];

    constructor(
        private app: pc.Application,
        public readonly definition:
            LevelDefinition
    ) {
        this.build();
    }

    private build(): void {
        this.buildGround();
        this.buildTraffic();
        this.buildRiver();
        this.buildGoals();
    }

    private buildGround(): void {
        for (
            const section
            of this.definition.ground
        ) {
            const entity =
                new pc.Entity(
                    section.name
                );

            entity.addComponent(
                'render',
                {
                    type: 'box',
                }
            );

            const topRow =
                Math.max(
                    section.startRow,
                    section.endRow
                );

            const bottomRow =
                Math.min(
                    section.startRow,
                    section.endRow
                );

            const rowCount =
                topRow - bottomRow + 1;

            const centerZ =
                (topRow + bottomRow) / 2;

            entity.setPosition(
                0,
                this.getGroundY(
                    section.type
                ),
                centerZ * CELL_SIZE
            );

            entity.setLocalScale(
                GRID_WIDTH,
                0.5,
                rowCount * CELL_SIZE
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                this.getGroundColor(
                    section.type
                );

            material.update();

            if (entity.render) {
                entity.render.material =
                    material;
            }

            this.app.root.addChild(
                entity
            );

            this.entities.push(
                entity
            );
        }
    }

    private buildTraffic(): void {
        for (
            const lane
            of this.definition.traffic
        ) {
            this.trafficLanes.push(
                new TrafficLane(
                    this.app,
                    lane
                )
            );
        }
    }

    private buildRiver(): void {
        for (
            const lane
            of this.definition.river
        ) {
            this.riverLanes.push(
                new RiverLane(
                    this.app,
                    lane
                )
            );
        }
    }

    private getGroundY(
        type: GroundType
    ): number {
        if (type === 'water') {
            return -0.35;
        }

        if (type === 'road') {
            return -0.3;
        }

        return -0.25;
    }

    private getGroundColor(
        type: GroundType
    ): pc.Color {
        switch (type) {
            case 'road':
                return new pc.Color(
                    0.035,
                    0.04,
                    0.055
                );

            case 'water':
                return new pc.Color(
                    0.015,
                    0.08,
                    0.16
                );

            case 'goal':
                return new pc.Color(
                    0.03,
                    0.16,
                    0.11
                );

            default:
                return new pc.Color(
                    0.03,
                    0.12,
                    0.09
                );
        }
    }

    public update(dt: number): void {
        for (
            const lane
            of this.trafficLanes
        ) {
            lane.update(dt);
        }

        for (
            const lane
            of this.riverLanes
        ) {
            lane.update(dt);
        }
    }

    public destroy(): void {
        for (
            const lane
            of this.trafficLanes
        ) {
            for (
                const vehicle
                of lane.vehicles
            ) {
                vehicle.destroy();
            }
        }

        for (
            const lane
            of this.riverLanes
        ) {
            for (
                const log
                of lane.logs
            ) {
                log.destroy();
            }
        }

        for (
            const entity
            of this.entities
        ) {
            entity.destroy();
        }

        this.trafficLanes = [];
        this.riverLanes = [];
        this.entities = [];
    }

    public getGroundTypeAt(
        z: number
    ): GroundType | null {
        const row =
            Math.round(
                z / CELL_SIZE
            );

        for (
            const section
            of this.definition.ground
        ) {
            const topRow =
                Math.max(
                    section.startRow,
                    section.endRow
                );

            const bottomRow =
                Math.min(
                    section.startRow,
                    section.endRow
                );

            if (
                row <= topRow &&
                row >= bottomRow
            ) {
                return section.type;
            }
        }

        return null;
    }

    public isWaterAt(
        z: number
    ): boolean {
        return (
            this.getGroundTypeAt(z) ===
            'water'
        );
    }

    public isGoalAt(
        z: number
    ): boolean {
        return z <=
            this.definition.goalZ;
    }

    public getStartPosition():
        pc.Vec3 {
        return new pc.Vec3(
            this.definition.startX,
            0.5,
            this.definition.startZ
        );
    }

    public getGoalZ(): number {
        return this.definition.goalZ;
    }

    private buildGoals(): void {
        for (
            const goal
            of this.definition.goals
        ) {
            const entity =
                new pc.Entity(
                    'Goal Frog'
                );

            entity.addComponent(
                'render',
                {
                    type: 'box',
                }
            );

            entity.setPosition(
                goal.x,
                0.35,
                goal.z
            );

            entity.setLocalScale(
                0.75,
                0.7,
                0.75
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                goal.color;

            material.emissive =
                goal.color;

            material.emissiveIntensity =
                0.7;

            material.update();

            if (entity.render) {
                entity.render.material =
                    material;
            }

            this.app.root.addChild(
                entity
            );

            this.entities.push(
                entity
            );
        }
    }
}