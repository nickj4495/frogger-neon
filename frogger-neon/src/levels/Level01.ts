import * as pc from 'playcanvas';

import type {
    LevelDefinition,
} from './LevelDefinition';

export const Level01: LevelDefinition = {
    id: 'level-01',

    name: 'Neon Crossing',

    startX: 0,
    startZ: 7,

    goalZ: -6,

    ground: [
        {
            name: 'Start',
            type: 'safe',

            startRow: 7,
            endRow: 6,
        },

        {
            name: 'Road',
            type: 'road',

            startRow: 5,
            endRow: 1,
        },

        {
            name: 'Median',
            type: 'safe',

            startRow: 0,
            endRow: 0,
        },

        {
            name: 'River',
            type: 'water',

            startRow: -1,
            endRow: -5,
        },

        {
            name: 'Goal',
            type: 'goal',

            startRow: -6,
            endRow: -6,
        },
    ],

    traffic: [
        // Lane 1:
        // slower medium cars
        {
            z: 5,

            speed: 3,
            direction: 1,

            vehicleCount: 4,
            spacing: 6,

            vehicleSize: 2,

            color: new pc.Color(
                1,
                0.05,
                0.5
            ),
        },

        // Lane 2:
        // fast small cars
        {
            z: 4,

            speed: 5.5,
            direction: -1,

            vehicleCount: 5,
            spacing: 5,

            vehicleSize: 1,

            color: new pc.Color(
                0.05,
                0.65,
                1
            ),
        },

        // Lane 3:
        // large slow trucks
        {
            z: 3,

            speed: 2.4,
            direction: 1,

            vehicleCount: 3,
            spacing: 8,

            vehicleSize: 3,

            color: new pc.Color(
                1,
                0.25,
                0.05
            ),
        },

        // Lane 4:
        // fast medium traffic
        {
            z: 2,

            speed: 6.5,
            direction: -1,

            vehicleCount: 4,
            spacing: 6,

            vehicleSize: 2,

            color: new pc.Color(
                0.65,
                0.1,
                1
            ),
        },

        // Lane 5:
        // dense small traffic
        {
            z: 1,

            speed: 4,
            direction: 1,

            vehicleCount: 6,
            spacing: 4,

            vehicleSize: 1,

            color: new pc.Color(
                0.05,
                1,
                0.65
            ),
        },
    ],

        river: [
        {
            z: -1,
            speed: 2,
            direction: 1,

            logCount: 4,
            spacing: 7,
            logSize: 3,
        },

        {
            z: -3,
            speed: 2.5,
            direction: 1,

            logCount: 3,
            spacing: 8,
            logSize: 4,
        },

        {
            z: -5,
            speed: 4,
            direction: 1,

            logCount: 4,
            spacing: 6,
            logSize: 2,
        },
    ],

        turtles: [
        {
            z: -2,

            speed: 3,
            direction: -1,

            groupCount: 4,
            spacing: 6,
            groupSize: 3,

            canSubmerge: false,
        },

        {
            z: -4,

            speed: 3.5,
            direction: -1,

            groupCount: 4,
            spacing: 7,
            groupSize: 3,

            canSubmerge: true,

            surfaceDuration: 3.5,
            submergedDuration: 1.25,
        },
    ],

    goals: [
        {
            x: -8,
            z: -6,
            color: new pc.Color(
                1,
                0.05,
                0.5
            ),
        },

        {
            x: -4,
            z: -6,
            color: new pc.Color(
                0.05,
                0.8,
                1
            ),
        },

        {
            x: 0,
            z: -6,
            color: new pc.Color(
                0.1,
                1,
                0.45
            ),
        },

        {
            x: 4,
            z: -6,
            color: new pc.Color(
                0.65,
                0.1,
                1
            ),
        },

        {
            x: 8,
            z: -6,
            color: new pc.Color(
                1,
                0.4,
                0.05
            ),
        },
    ],
};