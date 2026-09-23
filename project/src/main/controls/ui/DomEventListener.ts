import Scenes from "../../app/scenes/Scenes.js";

type params = {
    onPlay: () => void,
    onSettings: () => void,
    onBack: () => void,
    onSceneMenu: () => void,
    onSceneChange: (scene: Scenes) => void,
    onSensitivityChange: (sensitivity: number) => void
}

export default class DomEventListener {
    constructor(params: params){
        const settingsButton = document.querySelector(".settings-button") as HTMLElement;
        const backButton = document.querySelector(".back-button") as HTMLElement;
        const playButton = document.querySelector(".play-button") as HTMLElement;
        const mouseSensitivityRange = document.querySelector(".mouse-sensitivity-input") as HTMLElement;
        

        settingsButton.addEventListener("click", () => {
            params.onSettings()
        });

        backButton.addEventListener("click", () => { 
            params.onBack()
        });

        playButton.addEventListener("click", () => {
            params.onPlay()
        });

        mouseSensitivityRange.addEventListener("input", (event) => {
            const target = event.target as HTMLInputElement;
            params.onSensitivityChange(Number(target.value));
        });

        this.addSceneEventListeners(params.onSceneMenu, params.onSceneChange)
    }

    addSceneEventListeners(onSceneMenu: () => void, onSceneChange: (scene: Scenes) => void){
        const scenesMenuButton = document.querySelector(".scenes-button") as HTMLElement;
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