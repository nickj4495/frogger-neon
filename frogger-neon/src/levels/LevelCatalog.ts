import type {
    LevelDefinition,
} from './LevelDefinition';

import {
    Level01,
} from './Level01';

export interface LevelCatalogEntry {
    id: string;

    number: number;

    name: string;

    theme: string;

    definition?:
        LevelDefinition;
}

export const LevelCatalog:
    LevelCatalogEntry[] = [
        {
            id: Level01.id,

            number:
                Level01.number,

            name:
                Level01.name,

            theme:
                Level01.theme,

            definition:
                Level01,
        },

        /*
         * Level 2 does not have gameplay
         * data yet.
         *
         * It can still appear in Level
         * Select as the next world.
         */
        {
            id: 'level-02',

            number: 2,

            name: 'Neon City',

            theme: 'neon-city',
        },
    ];