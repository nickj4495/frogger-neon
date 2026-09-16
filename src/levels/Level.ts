import * as pc from 'playcanvas';

import { TrafficLane } from '../TrafficLane';
import { RiverLane } from '../RiverLane';
import {
    TurtleLane,
} from '../TurtleLane';

import {
    CELL_SIZE,
    GRID_WIDTH,
    LANDING_SNAP_DISTANCE,
} from '../core/Grid';

import type {
    LevelDefinition,
    GroundType,
} from './LevelDefinition';

interface GoalState {
    x: number;
    z: number;

    collected: boolean;

    entity: pc.Entity;
}

export class Level {

    private goals: GoalState[] = [];

    public trafficLanes:
        TrafficLane[] = [];

    public riverLanes:
        RiverLane[] = [];

    public turtleLanes:
        TurtleLane[] = [];

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
        this.buildTurtles();
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

        private buildTurtles(): void {
        for (
            const definition
            of this.definition.turtles
        ) {
            const lane =
                new TurtleLane(
                    this.app,
                    definition
                );

            this.turtleLanes.push(
                lane
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

        for (
            const lane
            of this.turtleLanes
        ) {
            lane.update(dt);
        }
    }

    public getGoalIndex(
        goal: GoalState
    ): number {
        return this.goals.indexOf(
            goal
        );
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
            const lane
            of this.turtleLanes
        ) {
            for (
                const platform
                of lane.platforms
            ) {
                platform.destroy();
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

        this.turtleLanes = [];

        this.goals = [];

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

            this.goals.push({
                x: goal.x,
                z: goal.z,

                collected: false,

                entity,
            });
        }
    }

    public getGoalAt(
        x: number,
        z: number
    ): GoalState | null {
        const row =
            Math.round(
                z / CELL_SIZE
            );

        let closestGoal:
            GoalState | null = null;

        let closestDistance =
            Infinity;

        for (const goal of this.goals) {
            const goalRow =
                Math.round(
                    goal.z /
                    CELL_SIZE
                );

            if (goalRow !== row) {
                continue;
            }

            const distance =
                Math.abs(
                    x - goal.x
                );

            if (
                distance <=
                    LANDING_SNAP_DISTANCE &&
                distance <
                    closestDistance
            ) {
                closestGoal = goal;

                closestDistance =
                    distance;
            }
        }

        return closestGoal;
    }

    public collectGoal(
        goal: GoalState
    ): boolean {
        if (goal.collected) {
            return false;
        }

        goal.collected = true;

        goal.entity.enabled = false;

        return true;
    }

    public getCollectedGoalCount():
        number {
        return this.goals.filter(
            goal => goal.collected
        ).length;
    }

    public getGoalCount(): number {
        return this.goals.length;
    }

    public areAllGoalsCollected():
        boolean {
        return (
            this.getCollectedGoalCount() ===
            this.getGoalCount()
        );
    }

    public getGoalColors():
        string[] {
        return this.definition.goals.map(
            goal => {
                const r =
                    Math.round(
                        goal.color.r *
                        255
                    );

                const g =
                    Math.round(
                        goal.color.g *
                        255
                    );

                const b =
                    Math.round(
                        goal.color.b *
                        255
                    );

                return `rgb(${r}, ${g}, ${b})`;
            }
        );
    }

    public isGoalCollected(
        index: number
    ): boolean {
        return (
            this.goals[index]
                ?.collected ??
            false
        );
    }

    public getGoalCollectionState():
        boolean[] {
        return this.goals.map(
            goal =>
                goal.collected
        );
    }
}