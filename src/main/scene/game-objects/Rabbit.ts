import { Transform, Vec3 } from "../../maths/index";
import { RabbitMesh } from "../../meshes/RabbitMesh";
import { GameObject } from "./GameObject";

export default class Rabbit extends GameObject {
    constructor(transform: Transform){
        super(transform)

        this.mesh = RabbitMesh;
    }
}
