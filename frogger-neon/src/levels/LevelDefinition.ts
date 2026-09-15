import * as pc from 'playcanvas';

export type GroundType =
    | 'safe'
    | 'road'
    | 'water'
    | 'goal';

export interface GroundSectionDefinition {
    name: string;
    type: GroundType;

    startRow: number;
    endRow: number;
}

export interface TrafficLaneDefinition {
    z: number;

    speed: number;
    direction: 1 | -1;

    vehicleCount: number;
    spacing: number;

    // Logical gameplay size.
    vehicleSize: number;

    color: pc.Color;
}

export interface RiverLaneDefinition {
    z: number;

    speed: number;
    direction: 1 | -1;

    logCount: number;
    spacing: number;

    // Logical number of platform slots.
    logSize: number;
}

export interface GoalDefinition {
    x: number;
    z: number;
    color: pc.Color;
}

export interface LevelDefinition {
    id: string;

    name: string;

    startX: number;
    startZ: number;

    goalZ: number;

    ground: GroundSectionDefinition[];

    traffic: TrafficLaneDefinition[];

    river: RiverLaneDefinition[];

    goals: GoalDefinition[];
}