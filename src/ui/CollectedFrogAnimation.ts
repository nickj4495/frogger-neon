export interface FlyingFrogOptions {
    color: string;

    startX: number;
    startY: number;

    endX: number;
    endY: number;

    duration?: number;

    onComplete?: () => void;
}

export class CollectedFrogAnimation {
    public fly(
        options: FlyingFrogOptions
    ): void {
        const frog =
            document.createElement(
                'div'
            );

        frog.className =
            'flying-collected-frog';

        frog.style.setProperty(
            '--frog-color',
            options.color
        );

        frog.style.left =
            `${options.startX}px`;

        frog.style.top =
            `${options.startY}px`;

        document.body.appendChild(
            frog
        );

        const duration =
            options.duration ??
            650;

        const deltaX =
            options.endX -
            options.startX;

        const deltaY =
            options.endY -
            options.startY;

        const animation =
            frog.animate(
                [
                    {
                        transform:
                            'translate(-50%, -50%) scale(1)',

                        opacity: 1,
                    },

                    {
                        transform:
                            `translate(
                                calc(-50% + ${deltaX * 0.45}px),
                                calc(-50% + ${deltaY * 0.25 - 45}px)
                            )
                            scale(1.15)`,

                        opacity: 1,

                        offset: 0.45,
                    },

                    {
                        transform:
                            `translate(
                                calc(-50% + ${deltaX}px),
                                calc(-50% + ${deltaY}px)
                            )
                            scale(0.45)`,

                        opacity: 0.85,
                    },
                ],

                {
                    duration,

                    easing:
                        'cubic-bezier(0.22, 1, 0.36, 1)',

                    fill: 'forwards',
                }
            );

        animation.onfinish =
            () => {
                frog.remove();

                options
                    .onComplete?.();
            };
    }
}