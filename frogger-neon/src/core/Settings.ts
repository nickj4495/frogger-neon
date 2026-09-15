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
    cameraZoom: 17,
    cameraHeight: 18,
    cameraFollowSpeed: 5,
    cameraDeadZone: 2,
    cameraHorizontalFollow: 0.025,

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

            this.values = {
                ...DEFAULT_SETTINGS,
                ...parsed,
            };
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
        this.values = {
            ...this.values,
            ...changes,
        };

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
}