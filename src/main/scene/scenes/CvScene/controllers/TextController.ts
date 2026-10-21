import GameSettings from "../../../../app/GameSettings";
import { Intent } from "../../../../maths/Intent";
import { GameObject } from "../../../game-objects/GameObject";
import { Controller } from "../../../../controls/in-game/controllers/Controller";
import InputReader from "../../../../controls/in-game/InputReader";

export class TextController implements Controller {
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
        let intent = Intent.empty();
        intent.yDirection = 1;
        return intent;
    }

    setInputReader(inputReader: InputReader): void {
        this.inputReader = inputReader
    }

    useSettings(settings: GameSettings): void {
        this.settings = settings
    }
}
