import { defaultSensitivity } from "../GameSettings.js";
import DomEventListener from "../../controls/ui/DomEventListener.js";
import GameState from "./GameState.js";
import RendererType from "../../utils/rendererTypes.js";
export default class GameStateManager {
    state = GameState.MainMenu;
    currentRendererType = RendererType.CPU;
    domEventListener;
    inputReader;
    gameSettings;
    uiController;
    constructor(inputReader, uiController, gameSettings, changeEngineScene, changeEngineRenderer) {
        this.inputReader = inputReader;
        this.uiController = uiController;
        this.gameSettings = gameSettings;
        this.domEventListener = new DomEventListener({
            onPlay: () => this.setState(GameState.PlayingMazdle),
            onSettings: () => this.setState(GameState.Settings),
            onBack: () => this.setState(GameState.MainMenu),
            onSceneMenu: () => this.uiController.toggleScenesMenu(),
            onSceneChange: changeEngineScene,
            onSensitivityChange: value => {
                this.gameSettings.mouseSensitivity = value * (defaultSensitivity / 50);
            },
            onRendererToggle: () => {
                this.currentRendererType = this.currentRendererType == RendererType.CPU ? RendererType.GPU : RendererType.CPU;
                changeEngineRenderer(this.currentRendererType);
                this.uiController.showCanvas(this.currentRendererType);
                this.uiController.highlightRenderer(this.currentRendererType);
            }
        });
    }
    update() {
        if (this.inputReader.pointerLockChanged && !this.inputReader.isPointerLocked) {
            console.log("Setting state to main menu");
            this.setState(GameState.MainMenu);
        }
    }
    async setState(newState) {
        const oldState = this.state;
        this.state = newState;
        switch (newState) {
            case GameState.MainMenu:
                console.log("Main menu");
                this.uiController.hideSettingsMenu();
                this.uiController.showMainMenu();
                break;
            case GameState.Settings:
                this.uiController.hideUiControls();
                this.uiController.showSettingsMenu();
                break;
            case GameState.PlayingMazdle:
                await document.body.requestPointerLock();
                // check to see pointer lock succeeded
                if (document.pointerLockElement != null) {
                    this.uiController.hideUiOverlay();
                }
                else {
                    this.state = oldState;
                }
                break;
            default:
                console.log("Not implemented state: " + newState.toLocaleString());
        }
    }
}
