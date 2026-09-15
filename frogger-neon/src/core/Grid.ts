export const CELL_SIZE = 1;

export const GRID_MIN_X = -9;
export const GRID_MAX_X = 9;

export const GRID_WIDTH =
    GRID_MAX_X - GRID_MIN_X + CELL_SIZE;

export function snapToGrid(
    value: number
): number {
    return (
        Math.round(value / CELL_SIZE) *
        CELL_SIZE
    );
}

export function clampToGrid(
    value: number
): number {
    return Math.max(
        GRID_MIN_X,
        Math.min(GRID_MAX_X, value)
    );
}

export function isInsideGrid(
    x: number
): boolean {
    return (
        x >= GRID_MIN_X &&
        x <= GRID_MAX_X
    );
}

export const MOVING_OBJECT_MARGIN =
    4 * CELL_SIZE;

export const MOVING_OBJECT_MIN_X =
    GRID_MIN_X -
    MOVING_OBJECT_MARGIN;

export const MOVING_OBJECT_MAX_X =
    GRID_MAX_X +
    MOVING_OBJECT_MARGIN;