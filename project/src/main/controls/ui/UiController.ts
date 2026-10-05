import Scenes from "../../app/scenes/Scenes.js";
import RendererType from "../../utils/rendererTypes.js";

export default class UiController {
    showMainMenu(){
        const uiOverlay = document.querySelector(".ui-overlay") as HTMLElement;
        const mainMenu = document.querySelector(".main-menu") as HTMLElement;
   
        uiOverlay.style.display = "flex";
        mainMenu.style.display = "block";
        this.showUiControls();
    }

    hideMainMenu(){
        const uiOverlay = document.querySelector(".ui-overlay") as HTMLElement;
        const mainMenu = document.querySelector(".main-menu") as HTMLElement;
   
        uiOverlay.style.display = "none";
        mainMenu.style.display = "none";
        this.hideUiOverlay();
    }

    showSettingsMenu(){
        const settingsMenu = document.querySelector(".settings-menu") as HTMLElement;
        const mainMenu = document.querySelector(".main-menu") as HTMLElement;

        this.hideUiControls()
        mainMenu.style.display = "none";
        settingsMenu.style.display = "block";
    }

    hideSettingsMenu(){
        const settingsMenu = document.querySelector(".settings-menu") as HTMLElement;
   
        settingsMenu.style.display = "none";
    }

    hideUiOverlay(){
        const uiOverlay = document.querySelector(".ui-overlay") as HTMLElement;

        uiOverlay.style.display = "none";
    }

    toggleScenesMenu(){
        const scenesMenu = document.querySelector(".scenes-menu") as HTMLElement;
        scenesMenu.classList.toggle("open")
    }

    showUiControls(){
        const uiControls = document.querySelector(".ui-controls") as HTMLElement;

        uiControls.style.display = "flex";
    }

    hideUiControls(){
        const uiControls = document.querySelector(".ui-controls") as HTMLElement;

        uiControls.style.display = "none";
    }

    setScene(scene: Scenes){
        const sceneString: string = Scenes[scene].toLowerCase();

        console.log(`Setting scene to ${sceneString}`)
        const sceneOptions = document.querySelectorAll(".scene-option");
        sceneOptions.forEach(option => {
            option.classList.remove("selected");
        })

        const selectedOption = document.querySelector(`.scene-option[data-scene="${sceneString}"]`);
        if (selectedOption) {
            selectedOption.classList.add("selected");
        }
    }

    highlightRenderer(rendererType: RendererType){
        const rendererString: string = RendererType[rendererType].toLowerCase();

        const rendererOptions = document.querySelectorAll(".renderer-option");
        rendererOptions.forEach(option => {

            if (option.classList.contains("selected")) {
                option.classList.remove("selected");
            }
            else {
                option.classList.add("selected");
            }
        })

        const selectedOption = document.querySelector(`.renderer-option[data-renderer="${rendererString}"]`);
        if (selectedOption) {
            selectedOption.classList.add("selected");
        }
    }

    showCanvas(rendererType: RendererType){
        const cpuCanvas = document.getElementById("cpu-canvas") as HTMLCanvasElement;
        const gpuCanvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        cpuCanvas.style.display = rendererType === RendererType.CPU ? "block" : "none";
        gpuCanvas.style.display = rendererType === RendererType.GPU ? "block" : "none";
    }
}