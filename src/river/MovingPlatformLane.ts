import * as pc from 'playcanvas';

export interface MovingPlatformLane {
    readonly z: number;

    readonly speed: number;

    readonly direction:
        1 | -1;

    readonly platforms:
        pc.Entity[];

    getSlotX(
        platform: pc.Entity,
        slotIndex: number
    ): number;

    getClosestSlot(
        platform: pc.Entity,
        frogX: number
    ): number | null;

    isValidSlot(
        slotIndex: number
    ): boolean;

    isPlatformSafe(
        platform: pc.Entity
    ): boolean;

    canLandOnPlatform(
        platform: pc.Entity
    ): boolean;
}