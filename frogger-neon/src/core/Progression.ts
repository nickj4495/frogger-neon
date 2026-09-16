export class Progression {
    private static readonly
        storageKey =
            'frogger-progression';

    private static unlockedLevel =
        1;

    public static load(): void {
        const stored =
            window.localStorage
                .getItem(
                    this.storageKey
                );

        if (!stored) {
            this.unlockedLevel =
                1;

            return;
        }

        const value =
            Number(stored);

        if (
            !Number.isFinite(
                value
            )
        ) {
            this.unlockedLevel =
                1;

            return;
        }

        this.unlockedLevel =
            Math.max(
                1,
                Math.floor(
                    value
                )
            );
    }

    public static isUnlocked(
        levelNumber: number
    ): boolean {
        return (
            levelNumber <=
            this.unlockedLevel
        );
    }

    public static unlock(
        levelNumber: number
    ): void {
        if (
            levelNumber <=
            this.unlockedLevel
        ) {
            return;
        }

        this.unlockedLevel =
            levelNumber;

        window.localStorage
            .setItem(
                this.storageKey,
                this.unlockedLevel
                    .toString()
            );
    }
}