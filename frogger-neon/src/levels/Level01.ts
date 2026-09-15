import * as pc from 'playcanvas';

import type {
    LevelDefinition,
} from './LevelDefinition';

export const Level01: LevelDefinition = {
    id: 'level-01',

    name: 'Neon Crossing',

    startX: 0,
    startZ: 5,

    goalZ: -10,

    ground: [
        {
            name: 'Start',
            type: 'safe',

            z: 5,
            depth: 4,
        },

        {
            name: 'Road',
            type: 'road',

            z: 0,
            depth: 6,
        },

        {
            name: 'Median',
            type: 'safe',

            z: -4,
            depth: 2,
        },

        {
            name: 'River',
            type: 'water',

            z: -7,
            depth: 4,
        },

        {
            name: 'Goal',
            type: 'goal',

            z: -11,
            depth: 2,
        },
    ],

    traffic: [
        {
            z: 2,

            speed: 3,
            direction: 1,

            vehicleCount: 3,
            spacing: 6,

            vehicleSize: 2,

            color: new pc.Color(
                1,
                0.05,
                0.5
            ),
        },

        {
            z: 0,

            speed: 4.5,
            direction: -1,

            vehicleCount: 3,
            spacing: 7,

            vehicleSize: 3,

            color: new pc.Color(
                0.05,
                0.65,
                1
            ),
        },

        {
            z: -2,

            speed: 5.5,
            direction: 1,

            vehicleCount: 4,
            spacing: 5,

            vehicleSize: 2,

            color: new pc.Color(
                1,
                0.25,
                0.05
            ),
        },
    ],

    river: [
        {
            z: -6,

            speed: 2,
            direction: 1,

            logCount: 3,
            spacing: 7,

            logSize: 3,
        },

        {
            z: -7,

            speed: 2.8,
            direction: -1,

            logCount: 3,
            spacing: 7,

            logSize: 2,
        },

        {
            z: -8,

            speed: 3.5,
            direction: 1,

            logCount: 3,
            spacing: 7,

            logSize: 3,
        },
    ],
};