import GameSettings from "../../../app/GameSettings.js";
import { Intent } from "../../../maths/Intent.js";
import { GameObject } from "../../../scene/game-objects/GameObject.js";
import { Controller } from "./Controller.js";
import InputReader from "../InputReader.js";

export class PlayerController implements Controller {
    target: GameObject;
    inputReader?: InputReader 
    settings: GameSettings

    constructor(target: GameObject, settings?: GameSettings, inputReader?: InputReader){
        this.target = target;
        this.inputReader = inputReader
        this.settings = settings ?? new GameSettings()
    }

    control(target: GameObject): void {
        this.target = target
    }

    getIntent(): Intent | null {
        if (!this.inputReader) return null
        let intent = Intent.empty();
        
        this.readKeyInput(intent)
        this.readMouseInput(intent)

        return intent;
    }

    setInputReader(inputReader: InputReader): void {
        this.inputReader = inputReader
    }

    readKeyInput(intent: Intent){
        const inputBuffer = this.inputReader!.inputBuffer
        if (inputBuffer.length == 0) return null

        inputBuffer.forEach(key => {
            switch (key){
                case "w":
                    intent.zDirection = 1
                    break;
                case "a":
                    intent.xDirection = -1
                    break;
                case "s":
                    intent.zDirection = -1
                    break;
                case "d":
                    intent.xDirection = 1
                    break;
                case 'arrowup':
                    intent.pitch = -1
                    break;
                case 'arrowleft':
                    intent.yaw = -1
                    break;
                case 'arrowdown':
                    intent.pitch = 1
                    break;
                case 'arrowright':
                    intent.yaw = 1
                    break;
            }
        })
    }

    useSettings(settings: GameSettings): void {
        this.settings = settings
    }

    readMouseInput(intent: Intent){
        const mouseSensitivity = this.settings.mouseSensitivity
        intent.pitch = this.inputReader!.mouseDeltaY  * mouseSensitivity
        intent.yaw = this.inputReader!.mouseDeltaX * mouseSensitivity
    }
}
