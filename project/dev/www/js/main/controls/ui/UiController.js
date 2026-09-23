export default class UiController {
    showMainMenu() {
        const uiOverlay = document.querySelector(".ui-overlay");
        const mainMenu = document.querySelector(".main-menu");
        uiOverlay.style.display = "flex";
        mainMenu.style.display = "block";
        this.showUiControls();
    }
    hideMainMenu() {
        const uiOverlay = document.querySelector(".ui-overlay");
        const mainMenu = document.querySelector(".main-menu");
        uiOverlay.style.display = "none";
        mainMenu.style.display = "none";
        this.hideUiOverlay();
    }
    showSettingsMenu() {
        const settingsMenu = document.querySelector(".settings-menu");
        const mainMenu = document.querySelector(".main-menu");
        this.hideUiControls();
        mainMenu.style.display = "none";
        settingsMenu.style.display = "block";
    }
    hideSettingsMenu() {
        const settingsMenu = document.querySelector(".settings-menu");
        settingsMenu.style.display = "none";
    }
    hideUiOverlay() {
        const uiOverlay = document.querySelector(".ui-overlay");
        uiOverlay.style.display = "none";
    }
    toggleScenesMenu() {
        const scenesMenu = document.querySelector(".scenes-menu");
        scenesMenu.classList.toggle("open");
    }
    showUiControls() {
        const uiControls = document.querySelector(".ui-controls");
        uiControls.style.display = "flex";
    }
    hideUiControls() {
        const uiControls = document.querySelector(".ui-controls");
        uiControls.style.display = "none";
    }
}
