export class TimerHUD {
    private element:
        HTMLDivElement;

    private valueElement:
        HTMLDivElement;

    constructor() {
        this.element =
            document.createElement(
                'div'
            );

        this.element.id =
            'timer-hud';

        const label =
            document.createElement(
                'div'
            );

        label.className =
            'timer-hud-label';

        label.textContent =
            'TIME';

        this.valueElement =
            document.createElement(
                'div'
            );

        this.valueElement.className =
            'timer-hud-value';

        this.valueElement.textContent =
            '30.0';

        this.element.appendChild(
            label
        );

        this.element.appendChild(
            this.valueElement
        );

        document.body.appendChild(
            this.element
        );
    }

    public update(
        seconds: number
    ): void {
        const safeSeconds =
            Math.max(
                0,
                seconds
            );

        this.valueElement.textContent =
            safeSeconds.toFixed(1);

        this.element.classList.toggle(
            'warning',
            safeSeconds <= 10
        );

        this.element.classList.toggle(
            'critical',
            safeSeconds <= 5
        );
    }
}