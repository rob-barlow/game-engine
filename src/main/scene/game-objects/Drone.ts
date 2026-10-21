import DroneMovementSystem from "../../controls/in-game/movement-systems/DroneMovementSystem";
import { Transform } from "../../maths/index";
import { GameObject } from "./GameObject";

export default class Drone extends GameObject {
    movementSystem = new DroneMovementSystem();
    
    constructor(transform: Transform){
        super(transform)
    }
}