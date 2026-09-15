import { Settings } from '../core/Settings';

export class SettingsMenu {
    private container: HTMLDivElement;
    private menuButton: HTMLButtonElement;

    constructor(
        private onOpen?: () => void,
        private onClose?: () => void
    ) {
        // ------------------------------------------
        // HAMBURGER BUTTON
        // ------------------------------------------

        this.menuButton =
            document.createElement('button');

        this.menuButton.id =
            'game-menu-button';

        this.menuButton.type = 'button';

        this.menuButton.setAttribute(
            'aria-label',
            'Open settings'
        );

        this.menuButton.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        document.body.appendChild(
            this.menuButton
        );

        // ------------------------------------------
        // SETTINGS OVERLAY
        // ------------------------------------------

        this.container =
            document.createElement('div');

        this.container.id =
            'settings-menu';

        document.body.appendChild(
            this.container
        );

        this.render();

        // Hamburger
        this.menuButton.addEventListener(
            'click',
            () => {
                this.toggle();
            }
        );

        // Clicking dark background closes menu.
        this.container.addEventListener(
            'click',
            (event) => {
                if (
                    event.target ===
                    this.container
                ) {
                    this.hide();
                }
            }
        );
    }

    private render(): void {
        const settings =
            Settings.get();

        this.container.innerHTML = `
            <div class="settings-panel">

                <div class="settings-top">
                    <div class="settings-title">
                        NEON CROSSING
                    </div>

                    <button
                        id="settings-x"
                        type="button"
                        aria-label="Close settings"
                    >
                        ×
                    </button>
                </div>

                <div class="settings-subtitle">
                    SETTINGS
                </div>

                <div class="settings-header">
                    CAMERA
                </div>

                ${this.createSlider(
                    'Camera Distance',
                    'cameraZoom',
                    4.25,
                    6,
                    0.25,
                    settings.cameraZoom
                )}

                ${this.createSlider(
                    'Camera Height',
                    'cameraHeight',
                    9,
                    12,
                    0.25,
                    settings.cameraHeight
                )}

                <div class="settings-header">
                    AUDIO
                </div>

                ${this.createSlider(
                    'Master Volume',
                    'masterVolume',
                    0,
                    1,
                    0.05,
                    settings.masterVolume
                )}

                ${this.createSlider(
                    'Music Volume',
                    'musicVolume',
                    0,
                    1,
                    0.05,
                    settings.musicVolume
                )}

                ${this.createSlider(
                    'SFX Volume',
                    'sfxVolume',
                    0,
                    1,
                    0.05,
                    settings.sfxVolume
                )}

                <div class="settings-actions">
                    <button id="settings-reset">
                        RESET DEFAULTS
                    </button>

                    <button id="settings-close">
                        RESUME
                    </button>
                </div>

            </div>
        `;

        this.bindEvents();
    }

    private createSlider(
        label: string,
        setting: string,
        min: number,
        max: number,
        step: number,
        value: number
    ): string {
        return `
            <label class="settings-row">

                <div class="settings-label">
                    <span>
                        ${label}
                    </span>

                    <span
                        data-value="${setting}"
                    >
                        ${value}
                    </span>
                </div>

                <input
                    type="range"
                    data-setting="${setting}"
                    min="${min}"
                    max="${max}"
                    step="${step}"
                    value="${value}"
                >

            </label>
        `;
    }

    private bindEvents(): void {
        const sliders =
            this.container
                .querySelectorAll<HTMLInputElement>(
                    '[data-setting]'
                );

        for (const slider of sliders) {
            slider.addEventListener(
                'input',
                () => {
                    const key =
                        slider.dataset.setting;

                    if (!key) {
                        return;
                    }

                    const value =
                        Number(
                            slider.value
                        );

                    Settings.update({
                        [key]: value,
                    });

                    const display =
                        this.container
                            .querySelector(
                                `[data-value="${key}"]`
                            );

                    if (display) {
                        display.textContent =
                            slider.value;
                    }
                }
            );
        }

        this.container
            .querySelector(
                '#settings-x'
            )
            ?.addEventListener(
                'click',
                () => {
                    this.hide();
                }
            );

        this.container
            .querySelector(
                '#settings-close'
            )
            ?.addEventListener(
                'click',
                () => {
                    this.hide();
                }
            );

        this.container
            .querySelector(
                '#settings-reset'
            )
            ?.addEventListener(
                'click',
                () => {
                    Settings.reset();
                    this.render();
                }
            );
    }

    public show(): void {
        if (this.isOpen()) {
            return;
        }

        this.container.classList.add(
            'visible'
        );

        this.menuButton.classList.add(
            'menu-open'
        );

        this.onOpen?.();
    }

    public hide(): void {
        if (!this.isOpen()) {
            return;
        }

        this.container.classList.remove(
            'visible'
        );

        this.menuButton.classList.remove(
            'menu-open'
        );

        this.onClose?.();
    }

    public toggle(): void {
        if (this.isOpen()) {
            this.hide();
        } else {
            this.show();
        }
    }

    public isOpen(): boolean {
        return this.container.classList.contains(
            'visible'
        );
    }
}