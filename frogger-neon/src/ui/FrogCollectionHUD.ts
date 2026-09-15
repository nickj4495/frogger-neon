export class FrogCollectionHUD {
    private container:
        HTMLDivElement;

    private frogs:
        HTMLDivElement[] = [];

    constructor(
        colors: string[]
    ) {
        this.container =
            document.createElement(
                'div'
            );

        this.container.id =
            'frog-collection-hud';

        document.body.appendChild(
            this.container
        );

        for (const color of colors) {
            const frog =
                document.createElement(
                    'div'
                );

            frog.className =
                'frog-collection-icon';

            frog.style.setProperty(
                '--frog-color',
                color
            );

            this.container.appendChild(
                frog
            );

            this.frogs.push(
                frog
            );
        }
    }

    public setCollected(
        index: number,
        collected: boolean
    ): void {
        const frog =
            this.frogs[index];

        if (!frog) {
            return;
        }

        frog.classList.toggle(
            'collected',
            collected
        );
    }

    public update(
        collected:
            boolean[]
    ): void {
        collected.forEach(
            (
                isCollected,
                index
            ) => {
                this.setCollected(
                    index,
                    isCollected
                );
            }
        );
    }
}