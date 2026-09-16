import * as pc from 'playcanvas';

import {
    MOVING_OBJECT_MIN_X,
    MOVING_OBJECT_MAX_X,
} from './core/Grid';

export interface TrafficLaneOptions {
    z: number;
    speed: number;
    direction: 1 | -1;

    vehicleCount: number;
    spacing: number;

    // Number of Frogger-sized cells
    // occupied by each vehicle.
    vehicleSize: number;

    color: pc.Color;
}

export class TrafficLane {
    public vehicles: pc.Entity[] = [];

    public readonly z: number;
    public readonly speed: number;
    public readonly direction: 1 | -1;
    public readonly vehicleSize: number;

    private readonly leftEdge = MOVING_OBJECT_MIN_X;
    private readonly rightEdge = MOVING_OBJECT_MAX_X;

    constructor(
        private app: pc.Application,
        options: TrafficLaneOptions
    ) {
        this.z = options.z;
        this.speed = options.speed;
        this.direction = options.direction;
        this.vehicleSize = options.vehicleSize;

        for (
            let i = 0;
            i < options.vehicleCount;
            i++
        ) {
            const vehicle = new pc.Entity(
                `Vehicle-${options.z}-${i}`
            );

            vehicle.addComponent('render', {
                type: 'box',
            });

            // One world unit = one gameplay cell.
            vehicle.setLocalScale(
                options.vehicleSize,
                0.7,
                0.75
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                options.color;

            material.emissive =
                options.color;

            material.emissiveIntensity =
                0.25;

            material.update();

            if (vehicle.render) {
                vehicle.render.material =
                    material;
            }

            vehicle.setPosition(
                -7 +
                    i * options.spacing,
                0.45,
                options.z
            );

            this.app.root.addChild(
                vehicle
            );

            this.vehicles.push(
                vehicle
            );
        }
    }

    update(dt: number): void {
        for (
            const vehicle
            of this.vehicles
        ) {
            const position =
                vehicle.getPosition();

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

            vehicle.setPosition(
                x,
                position.y,
                position.z
            );
        }
    }

    /**
     * Returns whether Frogger's one-cell
     * footprint overlaps this vehicle.
     */
    public containsPlayer(
        vehicle: pc.Entity,
        playerX: number
    ): boolean {
        const vehicleX =
            vehicle.getPosition().x;

        const halfVehicle =
            this.vehicleSize / 2;

        const halfPlayer = 0.5;

        return (
            Math.abs(
                playerX - vehicleX
            ) <
            halfVehicle + halfPlayer
        );
    }
}