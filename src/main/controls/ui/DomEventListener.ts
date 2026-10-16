import Scenes from "../../scene/scenes/Scenes.js";

type params = {
    onPlay: () => void,
    onSettings: () => void,
    onBack: () => void,
    onSceneMenu: () => void,
    onSceneChange: (scene: Scenes) => void,
    onSensitivityChange: (sensitivity: number) => void,
    onRendererToggle: () => void
}

export default class DomEventListener {
    constructor(params: params){
        const settingsButton = document.querySelector(".settings-button") as HTMLElement;
        const backButton = document.querySelector(".back-button") as HTMLElement;
        const playButton = document.querySelector(".play-button") as HTMLElement;
        const mouseSensitivityRange = document.querySelector(".mouse-sensitivity-input") as HTMLElement;
        const toggleRendererButton = document.querySelector(".renderer-button") as HTMLElement;

        playButton.addEventListener("click", () => {
            params.onPlay();
        });

        settingsButton.addEventListener("click", () => {
            params.onSettings()
        });

        backButton.addEventListener("click", () => { 
            params.onBack()
        });

        toggleRendererButton.addEventListener("click", () => {
            params.onRendererToggle()
        });

        mouseSensitivityRange.addEventListener("input", (event) => {
            const target = event.target as HTMLInputElement;
            params.onSensitivityChange(Number(target.value));
        });

        this.addSceneEventListeners(params.onSceneMenu, params.onSceneChange)
    }

    addSceneEventListeners(onSceneMenu: () => void, onSceneChange: (scene: Scenes) => void){
        const scenesMenuButton = document.querySelector(".scenes-button") as HTMLElement;

        const scenes = document.querySelectorAll(".scene-option");

        scenes.forEach(scene => {
            const sceneName = scene.getAttribute("data-scene") as string as keyof typeof Scenes;
            const sceneEnum = Scenes[sceneName]; 
            scene.addEventListener("click", () => {
                onSceneChange(sceneEnum);
            });
        })


        const mazeSceneButton = document.getElementById("maze-scene") as HTMLElement;
        const rabbitSceneButton = document.getElementById("rabbit-scene") as HTMLElement;

        scenesMenuButton.addEventListener("click", () => {
            onSceneMenu();
        });

        mazeSceneButton.addEventListener("click", () => {
            onSceneChange(Scenes.Maze)
        })
        
        rabbitSceneButton.addEventListener("click", () => {
            onSceneChange(Scenes.Rabbit)
        })
    }
}