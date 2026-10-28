import { Scene } from "../../scene/Scene";

export default interface Pass {
    render(scene: Scene): void;
}