import * as pc from 'playcanvas';

export interface TrafficLaneOptions {
    z: number;
    speed: number;
    direction: 1 | -1;
    vehicleCount: number;
    spacing: number;
    color: pc.Color;
    vehicleLength?: number;
}

export class TrafficLane {
    public vehicles: pc.Entity[] = [];

    private readonly leftEdge = -10;
    private readonly rightEdge = 10;

    constructor(
        private app: pc.Application,
        options: TrafficLaneOptions
    ) {
        const vehicleLength = options.vehicleLength ?? 2;

        for (let i = 0; i < options.vehicleCount; i++) {
            const vehicle = new pc.Entity(`Vehicle-${options.z}-${i}`);

            vehicle.addComponent('render', {
                type: 'box',
            });

            vehicle.setLocalScale(
                vehicleLength,
                0.7,
                0.75
            );

            const material = new pc.StandardMaterial();
            material.diffuse = options.color;
            material.emissive = options.color;
            material.emissiveIntensity = 0.25;
            material.update();

            if (vehicle.render) {
                vehicle.render.material = material;
            }

            const startX =
                -7 +
                i * options.spacing;

            vehicle.setPosition(
                startX,
                0.45,
                options.z
            );

            this.app.root.addChild(vehicle);
            this.vehicles.push(vehicle);
        }

        this.speed = options.speed;
        this.direction = options.direction;
    }

    private speed: number;
    private direction: 1 | -1;

    update(dt: number): void {
        for (const vehicle of this.vehicles) {
            const position = vehicle.getPosition();

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
}