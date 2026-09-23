import Scenes from "../../app/scenes/Scenes.js";
export default class DomEventListener {
    constructor(params) {
        const settingsButton = document.querySelector(".settings-button");
        const backButton = document.querySelector(".back-button");
        const playButton = document.querySelector(".play-button");
        const mouseSensitivityRange = document.querySelector(".mouse-sensitivity-input");
        settingsButton.addEventListener("click", () => {
            params.onSettings();
        });
        backButton.addEventListener("click", () => {
            params.onBack();
        });
        playButton.addEventListener("click", () => {
            params.onPlay();
        });
        mouseSensitivityRange.addEventListener("input", (event) => {
            const target = event.target;
            params.onSensitivityChange(Number(target.value));
        });
        this.addSceneEventListeners(params.onSceneMenu, params.onSceneChange);
    }
    addSceneEventListeners(onSceneMenu, onSceneChange) {
        const scenesMenuButton = document.querySelector(".scenes-button");
        const mazeSceneButton = document.getElementById("maze-scene");
        const rabbitSceneButton = document.getElementById("rabbit-scene");
        scenesMenuButton.addEventListener("click", () => {
            onSceneMenu();
        });
        mazeSceneButton.addEventListener("click", () => {
            onSceneChange(Scenes.Maze);
        });
        rabbitSceneButton.addEventListener("click", () => {
            onSceneChange(Scenes.Rabbit);
        });
    }
}
