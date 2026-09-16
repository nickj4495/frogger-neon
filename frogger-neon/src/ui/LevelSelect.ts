import {
    Progression,
} from '../core/Progression';

import type {
    LevelCatalogEntry,
} from '../levels/LevelCatalog';

export class LevelSelect {
    private element:
        HTMLDivElement;

    private levelsElement:
        HTMLDivElement;

    private onSelect:
        (
            level:
                LevelCatalogEntry
        ) => void;

    constructor(
        private levels:
            LevelCatalogEntry[],

        onSelect:
            (
                level:
                    LevelCatalogEntry
            ) => void
    ) {
        this.onSelect =
            onSelect;

        this.element =
            document.createElement(
                'div'
            );

        this.element.id =
            'level-select';

        const panel =
            document.createElement(
                'div'
            );

        panel.className =
            'level-select-panel';

        const eyebrow =
            document.createElement(
                'div'
            );

        eyebrow.className =
            'level-select-eyebrow';

        eyebrow.textContent =
            'SELECT YOUR CROSSING';

        const title =
            document.createElement(
                'div'
            );

        title.className =
            'level-select-title';

        title.textContent =
            'LEVEL SELECT';

        this.levelsElement =
            document.createElement(
                'div'
            );

        this.levelsElement.className =
            'level-select-levels';

        panel.appendChild(
            eyebrow
        );

        panel.appendChild(
            title
        );

        panel.appendChild(
            this.levelsElement
        );

        this.element.appendChild(
            panel
        );

        document.body.appendChild(
            this.element
        );

        this.renderLevels();
    }

    private renderLevels(): void {
        this.levelsElement
            .replaceChildren();

        for (
            const level
            of this.levels
        ) {
            const unlocked =
                Progression.isUnlocked(
                    level.number
                );

            const playable =
                unlocked &&
                !!level.definition;

            const button =
                document.createElement(
                    'button'
                );

            button.className =
                'level-select-card';

            if (!unlocked) {
                button.classList.add(
                    'locked'
                );
            }

            if (
                unlocked &&
                !level.definition
            ) {
                button.classList.add(
                    'coming-soon'
                );
            }

            const number =
                document.createElement(
                    'div'
                );

            number.className =
                'level-select-number';

            number.textContent =
                `LEVEL ${level.number
                    .toString()
                    .padStart(
                        2,
                        '0'
                    )}`;

            const name =
                document.createElement(
                    'div'
                );

            name.className =
                'level-select-name';

            name.textContent =
                level.name;

            const status =
                document.createElement(
                    'div'
                );

            status.className =
                'level-select-status';

            if (!unlocked) {
                status.textContent =
                    'LOCKED';
            } else if (
                !level.definition
            ) {
                status.textContent =
                    'COMING SOON';
            } else {
                status.textContent =
                    'PLAY';
            }

            button.appendChild(
                number
            );

            button.appendChild(
                name
            );

            button.appendChild(
                status
            );

            button.disabled =
                !playable;

            if (playable) {
                button.addEventListener(
                    'click',
                    () => {
                        this.onSelect(
                            level
                        );
                    }
                );
            }

            this.levelsElement
                .appendChild(
                    button
                );
        }
    }

    public show(): void {
        this.renderLevels();

        this.element.classList.add(
            'visible'
        );
    }

    public hide(): void {
        this.element.classList.remove(
            'visible'
        );
    }
}