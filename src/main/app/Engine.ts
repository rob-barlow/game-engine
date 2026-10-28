import { Controller } from "../controls/in-game/controllers/Controller";
import InputReader from "../controls/in-game/InputReader";
import { Intent } from "../maths/Intent";
import { Scene } from "../scene/Scene";
import GameSettings from "./GameSettings";
import GameState from "./state/GameState";
import GameStateManager from "./state/GameStateManager";
import UiController from "../controls/ui/UiController";
import Scenes from "../scene/scenes/Scenes";
import RendererType from "../utils/rendererTypes";
import { Renderer } from "../rendering/Renderer";
import { CpuRenderer } from "../rendering/cpu/CpuRenderer";
import { GpuRenderer } from "../rendering/gpu/GpuRenderer";
import { createMazeScene } from "../scene/scenes/MazeScene/MazeScene";
import { createRabbitScene } from "../scene/scenes/RabbitScene/RabbitScene";
import { createTestScene } from "../scene/scenes/TestScene/TestScene";
import { createCvScene } from "../scene/scenes/CvScene/CvScene";

export class Engine{
    renderer: Renderer = new CpuRenderer();
    scene: Scene;
    controllers: Controller[] = [];

    inputReader: InputReader = new InputReader()

    lastFrameTimestamp: number = 0;
    lastSecondTimestamp: number = 0;
    frames: number = 0;
    fpsElement: HTMLElement = document.getElementById("fps");

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
        this.frames++;
        const dt = Math.min((now - this.lastFrameTimestamp) / 1000, 0.3);
        this.lastFrameTimestamp = now;

        this.gameStateManager.update()

        switch (this.gameStateManager.state){
            case GameState.PlayingMazdle:
                this.updateGame(dt);
                this.renderer.render(this.scene);
     
                if (now - this.lastSecondTimestamp >= 1000) {
                    this.fpsElement.textContent = `${this.frames} FPS`;
                    this.frames = 0;
                    this.lastSecondTimestamp = now;
                }
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
            case Scenes.Test:
                ({scene, controllers} = createTestScene());
                break;
            default:
                ({scene, controllers} = createCvScene());
                break;
                }
                
        this.scene = scene;
        this.controllers = controllers

        let numOfTriangles = 0;

        this.scene.gameObjects.forEach(gameObj => {
            const currentMesh = gameObj.mesh
            if (currentMesh){
                numOfTriangles+= currentMesh.triangles.length
            }
        })

        console.log("triangles in the scene: " + numOfTriangles);
        
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