import InputReader from "../../controls/in-game/InputReader.js";
import GameSettings, { defaultSensitivity } from "../GameSettings.js";
import DomEventListener from "../../controls/ui/DomEventListener.js";
import GameState from "./GameState.js";
import UiController from "../../controls/ui/UiController.js";
import Scenes from "../scenes/Scenes.js";

export default class GameStateManager {
    state: GameState = GameState.MainMenu

    domEventListener: DomEventListener

    inputReader: InputReader

    gameSettings: GameSettings

    uiController: UiController

    constructor(inputReader: InputReader, uiController: UiController, gameSettings: GameSettings, onSceneChange: (scene: Scenes) => void){
        this.inputReader = inputReader
        this.uiController = uiController
        this.gameSettings = gameSettings
        this.domEventListener = new DomEventListener({
            onPlay: () => this.setState(GameState.PlayingMazdle),
            onSettings: () => this.setState(GameState.Settings),
            onBack: () => this.setState(GameState.MainMenu),
            onSceneMenu: () => this.uiController.toggleScenesMenu(),
            onSceneChange: onSceneChange,
            onSensitivityChange: value => {
                this.gameSettings.mouseSensitivity = value * (defaultSensitivity/50)
            }
        })
    }

    update(){
        this.updateState()
    }
    
    updateState(){
        // update paused state
        if (this.inputReader.pointerLockChanged && !this.inputReader.isPointerLocked){
            console.log("Setting state to main menu")
            this.setState(GameState.MainMenu)
        }
    }

    setState(newState: GameState) {
        const oldState = this.state;
        this.state = newState;

        switch (newState) {
            case GameState.MainMenu:
                console.log("Main menu")
                this.uiController.hideSettingsMenu()
                this.uiController.showMainMenu()
                break

            case GameState.Settings:
                this.uiController.hideUiControls()
                this.uiController.showSettingsMenu()
                break

            case GameState.PlayingMazdle:
                this.uiController.hideUiOverlay()
                break

            default:
                console.log("Not implemented state: " + newState.toLocaleString())
        }
    }
}