import { Transform } from "../../../../maths/Transform";
import { GameObject } from "../../../game-objects/GameObject";
import CvCameraMovementSystem from "../movement-systems/CvCameraMovementSystem";

export default class CvCamera extends GameObject {
    movementSystem = new CvCameraMovementSystem();
    
    constructor(transform: Transform){
        super(transform)
    }
}