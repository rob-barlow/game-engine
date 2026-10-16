import GameSettings from "../../../app/GameSettings.js";
import { Intent } from "../../../maths/Intent.js";
export class PlayerController {
    target;
    inputReader;
    settings;
    constructor(target, settings, inputReader) {
        this.target = target;
        this.inputReader = inputReader;
        this.settings = settings ?? new GameSettings();
    }
    control(target) {
        this.target = target;
    }
    getIntent() {
        if (!this.inputReader)
            return null;
        let intent = Intent.empty();
        this.readKeyInput(intent);
        this.readMouseInput(intent);
        return intent;
    }
    setInputReader(inputReader) {
        this.inputReader = inputReader;
    }
    readKeyInput(intent) {
        const inputBuffer = this.inputReader.inputBuffer;
        if (inputBuffer.length == 0)
            return null;
        inputBuffer.forEach(key => {
            switch (key) {
                case "w":
                    intent.zDirection = 1;
                    break;
                case "a":
                    intent.xDirection = -1;
                    break;
                case "s":
                    intent.zDirection = -1;
                    break;
                case "d":
                    intent.xDirection = 1;
                    break;
                case 'arrowup':
                    intent.pitch = -1;
                    break;
                case 'arrowleft':
                    intent.yaw = -1;
                    break;
                case 'arrowdown':
                    intent.pitch = 1;
                    break;
                case 'arrowright':
                    intent.yaw = 1;
                    break;
            }
        });
    }
    useSettings(settings) {
        this.settings = settings;
    }
    readMouseInput(intent) {
        const mouseSensitivity = this.settings.mouseSensitivity;
        intent.pitch = this.inputReader.mouseDeltaY * mouseSensitivity;
        intent.yaw = this.inputReader.mouseDeltaX * mouseSensitivity;
    }
}
