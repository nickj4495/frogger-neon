export type GameState =
    | 'playing'
    | 'paused'
    | 'dead'
    | 'goalCelebration'
    | 'levelComplete'
    | 'gameOver';