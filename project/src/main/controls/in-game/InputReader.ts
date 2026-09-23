import { ArrowKey, WasdKey } from "../../utils/types.js";

export default class InputReader {
    inputBuffer: (WasdKey | ArrowKey)[] = [];

    lastPressed: (WasdKey | ArrowKey)[] = [];

    isPointerLocked: boolean = false;
    pointerLockChanged: boolean = false;

    mouseDeltaX: number = 0
    mouseDeltaY: number = 0

    constructor(){
        this.addEventListeners()
    }

    addEventListeners(){
        this.addKeyEventListeners();
        this.addMouseEventListeners();
    }

    addKeyEventListeners(){
        document.addEventListener('keydown', event => {
            const keyPressed = event.key.toLowerCase()
            switch (keyPressed){
                case 'arrowup':
                case 'arrowleft':
                case 'arrowdown':
                case 'arrowright':
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    if (!this.inputBuffer.includes(keyPressed)){
                        this.inputBuffer.push(keyPressed);
                    }
                    break;
            }
        })

        

        document.addEventListener('keyup', event => {
            const keyPressed = event.key.toLowerCase()
            switch (keyPressed){
                case 'arrowup':
                case 'arrowleft':
                case 'arrowdown':
                case 'arrowright':
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    this.lastPressed.push(keyPressed);

                    const index = this.inputBuffer.indexOf(keyPressed);

                    if (index !== -1) {
                        this.inputBuffer.splice(index, 1);
                    }
                    break;
            }
        })
    }

    addMouseEventListeners(){
        document.addEventListener('pointerlockchange', (event) => {
            this.isPointerLocked = document.pointerLockElement != null
            this.pointerLockChanged = true
        })

        document.addEventListener('mousemove', (event: MouseEvent) => {
            this.mouseDeltaX += event.movementX
            this.mouseDeltaY += event.movementY
        });
    }

    iterateFrame(){
        this.mouseDeltaX = 0
        this.mouseDeltaY = 0
        this.pointerLockChanged = false
        this.lastPressed.length = 0
    }
}
