import * as pc from 'playcanvas';

export type GroundType =
    | 'safe'
    | 'road'
    | 'water'
    | 'goal';

export interface GroundSectionDefinition {
    name: string;

    type: GroundType;

    z: number;

    // Length along the Z axis, measured
    // in Frogger-sized cells.
    depth: number;
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

export interface LevelDefinition {
    id: string;

    name: string;

    startX: number;
    startZ: number;

    goalZ: number;

    ground: GroundSectionDefinition[];

    traffic: TrafficLaneDefinition[];

    river: RiverLaneDefinition[];
}