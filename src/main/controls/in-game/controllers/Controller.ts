import GameSettings from "../../../app/GameSettings";
import { Intent } from "../../../maths/Intent";
import { GameObject } from "../../../scene/game-objects/GameObject";
import InputReader from "../InputReader";

export interface Controller {
    target: GameObject;
    inputReader?: InputReader
    settings?: GameSettings
    
    control(target: GameObject): void;
    getIntent(): Intent | null;
    setInputReader(inputReader: InputReader): void
    useSettings(settings: GameSettings): void
}