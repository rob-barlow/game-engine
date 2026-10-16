export const defaultSensitivity = 0.05

class GameSettings {
    mouseSensitivity: number

    constructor(mouseSensitivity: number = defaultSensitivity){
        this.mouseSensitivity = mouseSensitivity
    }
}

export default GameSettings