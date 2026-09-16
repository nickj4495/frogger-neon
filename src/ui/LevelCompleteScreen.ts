export interface LevelCompleteData {
    levelName: string;
    time: number;
    lives: number;
    score: number;
}

export class LevelCompleteScreen {
    private element:
        HTMLDivElement;

    private levelElement:
        HTMLDivElement;

    private timeElement:
        HTMLDivElement;

    private livesElement:
        HTMLDivElement;

    private scoreElement:
        HTMLDivElement;

    private continueButton:
        HTMLButtonElement;

    private onContinue:
        (() => void) | null =
            null;

    constructor() {
        this.element =
            document.createElement(
                'div'
            );

        this.element.id =
            'level-complete-screen';

        const panel =
            document.createElement(
                'div'
            );

        panel.className =
            'level-complete-panel';

        const eyebrow =
            document.createElement(
                'div'
            );

        eyebrow.className =
            'level-complete-eyebrow';

        eyebrow.textContent =
            'ALL FROGS SECURED';

        const title =
            document.createElement(
                'div'
            );

        title.className =
            'level-complete-title';

        title.textContent =
            'LEVEL COMPLETE';

        this.levelElement =
            document.createElement(
                'div'
            );

        this.levelElement.className =
            'level-complete-level';

        const divider =
            document.createElement(
                'div'
            );

        divider.className =
            'level-complete-divider';

        const stats =
            document.createElement(
                'div'
            );

        stats.className =
            'level-complete-stats';

        this.timeElement =
            document.createElement(
                'div'
            );

        this.livesElement =
            document.createElement(
                'div'
            );

        this.scoreElement =
            document.createElement(
                'div'
            );

        this.continueButton =
            document.createElement(
                'button'
            );

        this.continueButton.className =
            'level-complete-continue';

        this.continueButton.textContent =
            'CONTINUE';

        this.continueButton.addEventListener(
            'click',
            () => {
                this.onContinue?.();
            }
        );

        stats.appendChild(
            this.timeElement
        );

        stats.appendChild(
            this.livesElement
        );

        stats.appendChild(
            this.scoreElement
        );

        panel.appendChild(
            eyebrow
        );

        panel.appendChild(
            title
        );

        panel.appendChild(
            this.levelElement
        );

        panel.appendChild(
            divider
        );

        panel.appendChild(
            stats
        );

        panel.appendChild(
            this.continueButton
        );

        this.element.appendChild(
            panel
        );

        document.body.appendChild(
            this.element
        );
    }

    public show(
        data: LevelCompleteData,
        onContinue: () => void
    ): void {
        this.onContinue =
            onContinue;

        this.levelElement.textContent =
            data.levelName;

        this.timeElement.textContent =
            `TOTAL TIME ${this.formatTime(
                data.time
            )}`;

        this.livesElement.textContent =
            `LIVES LEFT ${data.lives}`;

        this.scoreElement.textContent =
            `SCORE ${data.score
                .toString()
                .padStart(
                    6,
                    '0'
                )}`;

        this.element.classList.add(
            'visible'
        );
    }

    public hide(): void {
        this.element.classList.remove(
            'visible'
        );

        this.onContinue =
            null;
    }

    private formatTime(
        seconds: number
    ): string {
        const minutes =
            Math.floor(
                seconds / 60
            );

        const remainingSeconds =
            seconds -
            minutes * 60;

        return (
            `${minutes
                .toString()
                .padStart(
                    2,
                    '0'
                )}:` +
            remainingSeconds
                .toFixed(2)
                .padStart(
                    5,
                    '0'
                )
        );
    }
}