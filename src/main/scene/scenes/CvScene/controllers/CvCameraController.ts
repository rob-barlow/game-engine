import GameSettings from "../../../../app/GameSettings";
import { Controller } from "../../../../controls/in-game/controllers/Controller";
import InputReader from "../../../../controls/in-game/InputReader";
import { Intent } from "../../../../maths/Intent";
import { GameObject } from "../../../game-objects/GameObject";

export class CvCameraController implements Controller {
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
                    intent.yDirection = 1
                    break;
                case "s":
                    intent.yDirection = -1
                    break;
                default:
                    break;
            }
        })
    }

    useSettings(settings: GameSettings): void {
        this.settings = settings
    }
}
