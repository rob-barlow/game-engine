import { Controller } from "../controls/in-game/controllers/Controller.js";
import InputReader from "../controls/in-game/InputReader.js";
import { Intent } from "../maths/Intent.js";
import { Scene } from "../scene/Scene.js";
import GameSettings from "./GameSettings.js";
import GameState from "./state/GameState.js";
import GameStateManager from "./state/GameStateManager.js";
import UiController from "../controls/ui/UiController.js";
import Scenes from "./scenes/Scenes.js";
import { createMazeScene } from "./scenes/MazeScene/MazeScene.js";
import { createRabbitScene } from "./scenes/RabbitScene/RabbitScene.js";
import RendererType from "../utils/rendererTypes.js";
import { Renderer } from "../rendering/Renderer.js";
import { CpuRenderer } from "../rendering/CpuRenderer.js";
import { GpuRenderer } from "../rendering/GpuRenderer.js";

export class Engine{
    renderer: Renderer = new CpuRenderer();
    scene: Scene;
    controllers: Controller[] = [];

    inputReader: InputReader = new InputReader()

    lastFrameTimestamp: number = 0;

    gameStateManager: GameStateManager
    gameSettings: GameSettings = new GameSettings()
    uiController: UiController = new UiController()

    constructor(initialScene: Scene, controllers: Controller[]){
        this.scene = initialScene;
        this.controllers = controllers

        this.gameStateManager = new GameStateManager(this.inputReader, this.uiController, this.gameSettings, this.changeScene, this.changeRenderer)

        this.controllers.forEach(controller => {
            controller.setInputReader(this.inputReader)
            controller.useSettings(this.gameSettings)
        })
    }
    
    start(){
        this.lastFrameTimestamp = performance.now();
        requestAnimationFrame(this.frame);
    }

    update(dt: number){
        this.gameStateManager.update()

        switch (this.gameStateManager.state){
            case GameState.PlayingMazdle:
                this.updateGame(dt);
                break;
            case GameState.MainMenu:
                break;
            case GameState.Settings:
                break;
        }

        this.inputReader.iterateFrame()
    }

    updateGame(dt: number){
        let intent: Intent | null

        this.controllers.forEach(controller => {
            intent = controller.getIntent();

            if (intent != null && controller.target.movementSystem){
                controller.target.movementSystem.move(controller.target, intent, this.scene, dt)
            }
        })
    }

    frame = (now: number) => {
        const dt = Math.min((now - this.lastFrameTimestamp) / 1000, 0.3);
        this.lastFrameTimestamp = now;

        this.gameStateManager.update()

        switch (this.gameStateManager.state){
            case GameState.PlayingMazdle:
                this.updateGame(dt);
                this.renderer.render(this.scene, Math.trunc(1/dt));
                break;
            case GameState.MainMenu:
                break;
            case GameState.Settings:
                break;
        }

        this.inputReader.iterateFrame()


        requestAnimationFrame(this.frame);
    }

    // callbacks
    changeScene = (sceneEnum: Scenes) => {
        this.uiController.setScene(sceneEnum);
        let scene: Scene;
        let controllers: Controller[];

        switch (sceneEnum){
            case Scenes.Maze:
                ({scene, controllers} = createMazeScene());
                break;
                case Scenes.Rabbit:
                    ({scene, controllers} = createRabbitScene());
                    break;
                }
                
        this.scene = scene;
        this.controllers = controllers
        
        this.controllers.forEach(controller => {
            controller.setInputReader(this.inputReader)
            controller.useSettings(this.gameSettings)
        })
    }

    changeRenderer = (rendererType: RendererType) => {
        switch (rendererType) {
            case RendererType.CPU:
                this.renderer = new CpuRenderer();
                break;
            case RendererType.GPU:
                this.renderer = new GpuRenderer();
                break;
        }
    }
}