import * as pc from 'playcanvas';

export interface RiverLaneOptions {
    z: number;
    speed: number;
    direction: 1 | -1;
    logCount: number;
    spacing: number;
    logLength: number;
}

export class RiverLane {
    public logs: pc.Entity[] = [];

    public readonly speed: number;
    public readonly direction: 1 | -1;

    private readonly leftEdge = -11;
    private readonly rightEdge = 11;

    constructor(
        private app: pc.Application,
        options: RiverLaneOptions
    ) {
        this.speed = options.speed;
        this.direction = options.direction;

        for (let i = 0; i < options.logCount; i++) {
            const log = new pc.Entity(`Log-${options.z}-${i}`);

            log.addComponent('render', {
                type: 'box',
            });

            log.setLocalScale(
                options.logLength,
                0.35,
                0.75
            );

            const material = new pc.StandardMaterial();

            material.diffuse = new pc.Color(
                0.22,
                0.07,
                0.025
            );

            material.update();

            if (log.render) {
                log.render.material = material;
            }

            log.setPosition(
                -7 + i * options.spacing,
                0.25,
                options.z
            );

            this.app.root.addChild(log);
            this.logs.push(log);
        }
    }

    update(dt: number): void {
        for (const log of this.logs) {
            const position = log.getPosition();

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

            log.setPosition(
                x,
                position.y,
                position.z
            );
        }
    }
}