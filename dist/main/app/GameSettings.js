export const defaultSensitivity = 0.05;
class GameSettings {
    mouseSensitivity;
    constructor(mouseSensitivity = defaultSensitivity) {
        this.mouseSensitivity = mouseSensitivity;
    }
}
export default GameSettings;
