import * as pc from 'playcanvas';

import {
    GRID_MIN_X,
    GRID_MAX_X,
} from '../core/Grid';

export class EdgeFog {
    private entities:
        pc.Entity[] = [];

    constructor(
        private app: pc.Application
    ) {
        this.buildSide(-1);
        this.buildSide(1);
    }

    private buildSide(
        direction: -1 | 1
    ): void {
        const layers = [
            {
                offset: 0.2,
                width: 0.5,
                opacity: 0.04,
            },
            {
                offset: 0.55,
                width: 0.6,
                opacity: 0.08,
            },
            {
                offset: 0.95,
                width: 0.7,
                opacity: 0.14,
            },
            {
                offset: 1.4,
                width: 0.8,
                opacity: 0.22,
            },
            {
                offset: 1.9,
                width: 0.9,
                opacity: 0.34,
            },
            {
                offset: 2.5,
                width: 1.0,
                opacity: 0.5,
            },
            {
                offset: 3.2,
                width: 1.2,
                opacity: 0.72,
            },
            {
                offset: 4.1,
                width: 1.5,
                opacity: 0.9,
            },
        ];

        const edgeX =
            direction < 0
                ? GRID_MIN_X
                : GRID_MAX_X;

        for (
            const layer
            of layers
        ) {
            const entity =
                new pc.Entity(
                    'Edge Fog'
                );

            entity.addComponent(
                'render',
                {
                    type: 'box',
                }
            );

            entity.setPosition(
                edgeX +
                    direction *
                        layer.offset,
                0.6,
                0
            );

            entity.setLocalScale(
                layer.width,
                3,
                32
            );

            const material =
                new pc.StandardMaterial();

            material.diffuse =
                new pc.Color(
                    0,
                    0,
                    0
                );

            material.emissive =
                new pc.Color(
                    0,
                    0,
                    0
                );

            material.opacity =
                layer.opacity;

            material.blendType =
                pc.BLEND_NORMAL;

            material.depthWrite =
                false;

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

    public destroy(): void {
        for (
            const entity
            of this.entities
        ) {
            entity.destroy();
        }

        this.entities = [];
    }
}