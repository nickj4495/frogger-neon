export const CELL_SIZE = 1;

export const GRID_MIN_X = -7;
export const GRID_MAX_X = 7;

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