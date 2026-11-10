import GameSettings from "../../../../app/GameSettings";
import { Intent } from "../../../../maths/Intent";
import { GameObject } from "../../../game-objects/GameObject";
import { Controller } from "../../../../controls/in-game/controllers/Controller";
import InputReader from "../../../../controls/in-game/InputReader";
import { BoidsMasterController } from "./BoidsMasterController";
import { Boid } from "../game-objects/Boid";

export class IndividualBoidController implements Controller {
    targets: Boid[];
    inputReader?: InputReader 
    settings: GameSettings
    masterController: BoidsMasterController;

    constructor(target: GameObject, masterController: BoidsMasterController, settings?: GameSettings, inputReader?: InputReader)
    constructor(targets: GameObject[], masterController: BoidsMasterController, settings?: GameSettings, inputReader?: InputReader)
    
    constructor(targetOrTargets: GameObject | GameObject[], masterController: BoidsMasterController, settings?: GameSettings, inputReader?: InputReader) {
        this.targets = Array.isArray(targetOrTargets)
            ? targetOrTargets as Boid[]
            : [targetOrTargets as Boid];
        this.inputReader = inputReader
        this.settings = settings ?? new GameSettings();
        this.masterController = masterController;
    }

    control(target: Boid): void {
        this.targets.push(target);
    }

    getIntent(): Intent | null {
        return this.masterController.getIntent(this);
    }

    setInputReader(inputReader: InputReader): void {
        this.inputReader = inputReader
    }

    useSettings(settings: GameSettings): void {
        this.settings = settings
    }
}
