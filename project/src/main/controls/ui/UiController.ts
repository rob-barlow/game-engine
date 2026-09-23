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
}