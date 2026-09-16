import * as pc from 'playcanvas';

import { Level } from './Level';

import type {
    LevelDefinition,
} from './LevelDefinition';

export class LevelManager {
    private currentLevel:
        Level | null = null;

    constructor(
        private app: pc.Application
    ) {}

    public load(
        definition: LevelDefinition
    ): Level {
        if (this.currentLevel) {
            this.currentLevel.destroy();
        }

        this.currentLevel =
            new Level(
                this.app,
                definition
            );

        return this.currentLevel;
    }

    public unload(): void {
        if (!this.currentLevel) {
            return;
        }

        this.currentLevel.destroy();

        this.currentLevel =
            null;
    }

    public getCurrentLevel():
        Level | null {
        return this.currentLevel;
    }

    public update(dt: number): void {
        this.currentLevel?.update(dt);
    }
}