export interface GoalCelebrationData {
    time: number;
    timeBonus: number;
    score: number;
}

export class GoalCelebration {
    private element:
        HTMLDivElement;

    private timeElement:
        HTMLDivElement;

    private bonusElement:
        HTMLDivElement;

    private scoreElement:
        HTMLDivElement;

    private continueButton:
        HTMLButtonElement;

    private onContinue:
        (() => void) | null =
            null;

    private onKeyDown =
        (
            event:
                KeyboardEvent
        ): void => {
            if (
                event.code !==
                    'Enter' &&
                event.code !==
                    'Space'
            ) {
                return;
            }

            if (!this.onContinue) {
                return;
            }

            event.preventDefault();

            this.onContinue();
        };

    constructor() {
        this.element =
            document.createElement(
                'div'
            );

        this.element.id =
            'goal-celebration';

        const panel =
            document.createElement(
                'div'
            );

        panel.className =
            'goal-celebration-panel';

        const eyebrow =
            document.createElement(
                'div'
            );

        eyebrow.className =
            'goal-celebration-eyebrow';

        eyebrow.textContent =
            'NEON CROSSING';

        const title =
            document.createElement(
                'div'
            );

        title.className =
            'goal-celebration-title';

        title.textContent =
            'GOAL SECURED';

        const divider =
            document.createElement(
                'div'
            );

        divider.className =
            'goal-celebration-divider';

        const timeLabel =
            document.createElement(
                'div'
            );

        timeLabel.className =
            'goal-celebration-label';

        timeLabel.textContent =
            'CROSSING TIME';

        this.timeElement =
            document.createElement(
                'div'
            );

        this.timeElement.className =
            'goal-celebration-time';

        const stats =
            document.createElement(
                'div'
            );

        stats.className =
            'goal-celebration-stats';

        this.bonusElement =
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
            'goal-celebration-continue';

        this.continueButton.textContent =
            'CONTINUE';

                this.continueButton.addEventListener(
            'click',
            () => {
                const callback =
                    this.onContinue;

                if (!callback) {
                    return;
                }

                callback();
            }
        );

        stats.appendChild(
            this.bonusElement
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
            divider
        );

        panel.appendChild(
            timeLabel
        );

        panel.appendChild(
            this.timeElement
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
        data: GoalCelebrationData,
        onContinue: () => void
    ): void {
        this.onContinue =
            onContinue;

        window.addEventListener(
            'keydown',
            this.onKeyDown
        );

        this.timeElement.textContent =
            `${data.time.toFixed(2)}s`;

        this.bonusElement.textContent =
            `TIME BONUS +${data.timeBonus}`;

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

        window.removeEventListener(
            'keydown',
            this.onKeyDown
        );

        this.onContinue =
            null;
    }
}