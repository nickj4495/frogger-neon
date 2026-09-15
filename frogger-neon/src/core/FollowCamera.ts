import * as pc from 'playcanvas';

import { Settings } from './Settings';

export class FollowCamera {
    private targetPosition =
        new pc.Vec3();

    private lookTarget =
        new pc.Vec3();

    private trackedZ: number;
    private trackedX: number;

    constructor(
        private camera: pc.Entity,
        private target: pc.Entity
    ) {
        const targetPosition =
            target.getPosition();

        this.trackedZ =
            targetPosition.z;

        this.trackedX =
            targetPosition.x;
    }

    update(dt: number): void {
        const settings =
            Settings.get();

        const playerPosition =
            this.target.getPosition();

        this.updateTrackedPosition(
            playerPosition,
            settings.cameraDeadZone,
            settings.cameraHorizontalFollow
        );

        this.targetPosition.set(
            this.trackedX,
            settings.cameraHeight,
            this.trackedZ +
                settings.cameraZoom
        );

        const currentPosition =
            this.camera.getPosition();

        const t =
            1 -
            Math.exp(
                -settings.cameraFollowSpeed *
                    dt
            );

        const x = pc.math.lerp(
            currentPosition.x,
            this.targetPosition.x,
            t
        );

        const y = pc.math.lerp(
            currentPosition.y,
            this.targetPosition.y,
            t
        );

        const z = pc.math.lerp(
            currentPosition.z,
            this.targetPosition.z,
            t
        );

        this.camera.setPosition(
            x,
            y,
            z
        );

        // Look slightly ahead of Frogger.
        this.lookTarget.set(
            this.trackedX,
            0,
            this.trackedZ - 3
        );

        this.camera.lookAt(
            this.lookTarget
        );
    }

    private updateTrackedPosition(
        playerPosition: pc.Vec3,
        deadZone: number,
        horizontalFollow: number
    ): void {
        const zDifference =
            playerPosition.z -
            this.trackedZ;

        if (
            zDifference < -deadZone
        ) {
            this.trackedZ =
                playerPosition.z +
                deadZone;
        }

        if (
            zDifference > deadZone
        ) {
            this.trackedZ =
                playerPosition.z -
                deadZone;
        }

        this.trackedX =
            pc.math.lerp(
                this.trackedX,
                playerPosition.x,
                horizontalFollow
            );
    }

    public reset(): void {
        const playerPosition =
            this.target.getPosition();

        this.trackedX =
            playerPosition.x;

        this.trackedZ =
            playerPosition.z;
    }
}