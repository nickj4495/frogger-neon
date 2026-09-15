import * as pc from 'playcanvas';

import { Settings } from './Settings';

export class FollowCamera {
    private targetPosition =
        new pc.Vec3();

    private lookTarget =
        new pc.Vec3();

    private trackedZ: number;
    private trackedX: number;

    private celebrationActive =
        false;

    private celebrationAmount =
        0;

    private celebrationTargetAmount =
        0;

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

        if (
            !this.celebrationActive
        ) {
            this.updateTrackedPosition(
                playerPosition,
                settings.cameraDeadZone,
                settings.cameraHorizontalFollow
            );
        }

        const celebrationSpeed =
            this.celebrationTargetAmount >
            this.celebrationAmount
                ? 2.1
                : 1.75;

        const celebrationT =
            1 -
            Math.exp(
                -celebrationSpeed *
                    dt
            );

        this.celebrationAmount =
            pc.math.lerp(
                this.celebrationAmount,
                this.celebrationTargetAmount,
                celebrationT
            );

        /*
         * Normal gameplay camera.
         */
        const normalX =
            this.trackedX;

        const normalY =
            settings.cameraHeight;

        const normalZ =
            this.trackedZ +
            settings.cameraZoom;

        /*
         * Goal celebration camera.
         *
         * Center directly on Frogger,
         * lower the camera and move it
         * closer.
         */
        const celebrationX =
            playerPosition.x;

        const celebrationY =
            Math.max(
                5.5,
                settings.cameraHeight -
                    3
            );

        const celebrationZ =
            playerPosition.z +
            Math.max(
                2.75,
                settings.cameraZoom -
                    1.5
            );

        this.targetPosition.set(
            pc.math.lerp(
                normalX,
                celebrationX,
                this.celebrationAmount
            ),

            pc.math.lerp(
                normalY,
                celebrationY,
                this.celebrationAmount
            ),

            pc.math.lerp(
                normalZ,
                celebrationZ,
                this.celebrationAmount
            )
        );

        const currentPosition =
            this.camera.getPosition();

        const followSpeed =
            this.celebrationActive
                ? 2.9
                : settings.cameraFollowSpeed;

        const t =
            1 -
            Math.exp(
                -followSpeed *
                    dt
            );

        const x =
            pc.math.lerp(
                currentPosition.x,
                this.targetPosition.x,
                t
            );

        const y =
            pc.math.lerp(
                currentPosition.y,
                this.targetPosition.y,
                t
            );

        const z =
            pc.math.lerp(
                currentPosition.z,
                this.targetPosition.z,
                t
            );

        this.camera.setPosition(
            x,
            y,
            z
        );

        /*
         * Normal gameplay looks ahead.
         * Celebration looks directly
         * at Frogger.
         */
        const normalLookX =
            this.trackedX;

        const normalLookZ =
            this.trackedZ -
            1.5;

        const celebrationLookX =
            playerPosition.x;

        const celebrationLookZ =
            playerPosition.z;

        this.lookTarget.set(
            pc.math.lerp(
                normalLookX,
                celebrationLookX,
                this.celebrationAmount
            ),

            0,

            pc.math.lerp(
                normalLookZ,
                celebrationLookZ,
                this.celebrationAmount
            )
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

    public startGoalCelebration():
        void {
        const playerPosition =
            this.target.getPosition();

        /*
         * Lock our normal tracked position
         * at the point the celebration
         * begins.
         */
        this.trackedX =
            playerPosition.x;

        this.trackedZ =
            playerPosition.z;

        this.celebrationActive =
            true;

        this.celebrationTargetAmount =
            1;
    }

    public endGoalCelebration():
        void {
        this.celebrationActive =
            false;

        this.celebrationTargetAmount =
            0;
    }

    public reset(): void {
        const playerPosition =
            this.target.getPosition();

        this.trackedX =
            playerPosition.x;

        this.trackedZ =
            playerPosition.z;

        this.celebrationAmount =
            0;

        this.celebrationTargetAmount =
            0;

        this.celebrationActive =
            false;
    }
}