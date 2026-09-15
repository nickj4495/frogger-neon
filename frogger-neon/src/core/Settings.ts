export interface GameSettings {
    cameraZoom: number;
    cameraHeight: number;
    cameraFollowSpeed: number;
    cameraDeadZone: number;
    cameraHorizontalFollow: number;

    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
}

const DEFAULT_SETTINGS: GameSettings = {
    cameraZoom: 4.75,
    cameraHeight: 10,

    cameraFollowSpeed: 7,
    cameraDeadZone: 1,
    cameraHorizontalFollow: 0.04,

    masterVolume: 1,
    musicVolume: 0.8,
    sfxVolume: 1,
};

export class Settings {
    private static readonly STORAGE_KEY =
        'neon-crossing-settings';

    private static values: GameSettings = {
        ...DEFAULT_SETTINGS,
    };

    public static load(): void {
        const saved =
            localStorage.getItem(
                this.STORAGE_KEY
            );

        if (!saved) {
            return;
        }

        try {
            const parsed =
                JSON.parse(saved);

            this.values =
                this.sanitize({
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                });
        } catch {
            console.warn(
                'Could not load saved settings.'
            );
        }
    }

    public static get(): GameSettings {
        return this.values;
    }

    public static update(
        changes: Partial<GameSettings>
    ): void {
        this.values =
            this.sanitize({
                ...this.values,
                ...changes,
            });

        this.save();
    }

    public static reset(): void {
        this.values = {
            ...DEFAULT_SETTINGS,
        };

        this.save();
    }

    private static save(): void {
        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(
                this.values
            )
        );
    }

    private static sanitize(
        settings: GameSettings
    ): GameSettings {
        return {
            ...settings,

            cameraZoom: Math.max(
                4.25,
                Math.min(
                    6,
                    settings.cameraZoom
                )
            ),

            cameraHeight: Math.max(
                9,
                Math.min(
                    12,
                    settings.cameraHeight
                )
            ),

            cameraFollowSpeed: 7,
            cameraDeadZone: 1,
            cameraHorizontalFollow: 0.04,
        };
    }
}