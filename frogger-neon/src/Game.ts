import { Player } from './Player';
import { TrafficLane } from './TrafficLane';
import { RiverLane } from './RiverLane';

export class Game {
    private lives = 3;
    private score = 0;
    private furthestZ = 5;

    private isDead = false;

    private hud: HTMLDivElement;
    private message: HTMLDivElement;

    constructor(
        private player: Player,
        private trafficLanes: TrafficLane[],
        private riverLanes: RiverLane[]
    ) {
        this.hud = this.createHUD();
        this.message = this.createMessage();

        this.updateHUD();
    }

    update(dt: number): void {
        if (this.isDead) return;

        this.checkVehicleCollisions();
        this.checkRiver(dt);
        this.checkForwardProgress();
        this.checkGoal();
    }

    private checkRiver(dt: number): void {
        const frogPosition = this.player.getPosition();

        // These are our three playable river rows.
        const isInRiver =
            frogPosition.z <= -6 &&
            frogPosition.z >= -8;

        if (!isInRiver) {
            return;
        }

        // Don't test for drowning while the frog is in
        // the middle of its hop.
        if (this.player.isCurrentlyMoving()) {
            return;
        }

        for (const lane of this.riverLanes) {
            const laneDistance = Math.abs(
                frogPosition.z - lane.logs[0].getPosition().z
            );

            if (laneDistance > 0.5) {
                continue;
            }

            for (const log of lane.logs) {
                const logPosition = log.getPosition();

                const logLength = log.getLocalScale().x;

                const xDistance = Math.abs(
                    frogPosition.x - logPosition.x
                );

                // Frog is standing on this log.
                if (xDistance <= logLength / 2 + 0.25) {
                    const newX =
                        frogPosition.x +
                        lane.speed *
                        lane.direction *
                        dt;

                    this.player.entity.setPosition(
                        newX,
                        frogPosition.y,
                        frogPosition.z
                    );

                    // The log carried us completely off-screen.
                    if (newX < -7.5 || newX > 7.5) {
                        this.killPlayer('SPLASH!');
                    }

                    return;
                }
            }

            // We found the river lane, but didn't find
            // a log underneath the frog.
            this.killPlayer('SPLASH!');
            return;
        }
    }

    private checkForwardProgress(): void {
        const frogPosition = this.player.getPosition();

        if (frogPosition.z < this.furthestZ) {
            this.furthestZ = frogPosition.z;

            this.score += 10;

            this.updateHUD();
        }
    }

    private checkGoal(): void {
        const frogPosition = this.player.getPosition();

        // Far side of the current map
        if (frogPosition.z <= -10) {
            this.reachGoal();
        }
    }

    private reachGoal(): void {
        if (this.isDead) return;

        this.isDead = true;

        this.score += 100;

        this.updateHUD();
        this.showMessage('+100');

        window.setTimeout(() => {
            // Reset forward-progress tracking for the next crossing.
            this.furthestZ = 5;

            this.player.reset();

            this.hideMessage();

            this.isDead = false;
        }, 650);
    }

    private checkVehicleCollisions(): void {
        const frogPosition = this.player.getPosition();

        for (const lane of this.trafficLanes) {
            for (const vehicle of lane.vehicles) {
                const vehiclePosition = vehicle.getPosition();

                // First make sure we're roughly in the same lane.
                const zDistance = Math.abs(
                    frogPosition.z - vehiclePosition.z
                );

                if (zDistance > 0.6) {
                    continue;
                }

                // Vehicle width based on its current scale.
                const vehicleWidth =
                    vehicle.getLocalScale().x;

                const xDistance = Math.abs(
                    frogPosition.x - vehiclePosition.x
                );

                const collisionDistance =
                    vehicleWidth / 2 + 0.35;

                if (xDistance < collisionDistance) {
                    this.killPlayer();
                    return;
                }
            }
        }
    }

    private killPlayer(message = 'SPLAT!'): void {
        if (this.isDead) return;

        this.isDead = true;
        this.lives--;

        this.updateHUD();

        this.showMessage(message);

        // Hide frog briefly.
        this.player.entity.enabled = false;

        window.setTimeout(() => {
            if (this.lives <= 0) {
                this.gameOver();
                return;
            }

            this.furthestZ = 5;

            this.player.reset();
            this.player.entity.enabled = true;

            this.hideMessage();

            this.isDead = false;
        }, 900);
    }

    private gameOver(): void {
        this.showMessage('GAME OVER');

        window.setTimeout(() => {
            this.lives = 3;
            this.score = 0;
            this.furthestZ = 5;

            this.player.reset();
            this.player.entity.enabled = true;

            this.updateHUD();
            this.hideMessage();

            this.isDead = false;
        }, 1800);
    }

    private createHUD(): HTMLDivElement {
        const hud = document.createElement('div');

        hud.id = 'game-hud';

        document.body.appendChild(hud);

        return hud;
    }

    private createMessage(): HTMLDivElement {
        const message = document.createElement('div');

        message.id = 'game-message';

        document.body.appendChild(message);

        return message;
    }

    private updateHUD(): void {
        this.hud.innerHTML = `
            <div class="hud-title">
                NEON CROSSING
            </div>

            <div class="hud-stats">
                <span>
                    SCORE ${this.score
                        .toString()
                        .padStart(6, '0')}
                </span>

                <span>
                    LIVES ${'●'.repeat(this.lives)}
                </span>
            </div>
        `;
    }

    private showMessage(text: string): void {
        this.message.textContent = text;
        this.message.classList.add('visible');
    }

    private hideMessage(): void {
        this.message.classList.remove('visible');
    }
}