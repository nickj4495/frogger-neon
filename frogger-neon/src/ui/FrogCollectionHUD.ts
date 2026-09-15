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

    public getSlotCenter(
        index: number
    ): {
        x: number;
        y: number;
    } | null {
        const frog =
            this.frogs[index];

        if (!frog) {
            return null;
        }

        const rect =
            frog.getBoundingClientRect();

        return {
            x:
                rect.left +
                rect.width / 2,

            y:
                rect.top +
                rect.height / 2,
        };
    }

    public celebrateSlot(
        index: number
    ): void {
        const frog =
            this.frogs[index];

        if (!frog) {
            return;
        }

        frog.classList.remove(
            'frog-arrived'
        );

        /*
         * Force the browser to acknowledge
         * the removed class so the animation
         * can replay.
         */
        void frog.offsetWidth;

        frog.classList.add(
            'collected',
            'frog-arrived'
        );

        window.setTimeout(
            () => {
                frog.classList.remove(
                    'frog-arrived'
                );
            },
            650
        );
    }
}