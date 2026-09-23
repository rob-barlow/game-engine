import GameSettings from "../../../app/GameSettings.js";
import { Intent } from "../../../maths/Intent.js";
import { GameObject } from "../../../scene/game-objects/GameObject.js";
import InputReader from "../InputReader.js";

export interface Controller {
    target: GameObject;
    inputReader?: InputReader
    settings?: GameSettings
    
    control(target: GameObject): void;
    getIntent(): Intent | null;
    setInputReader(inputReader: InputReader): void
    useSettings(settings: GameSettings): void
}