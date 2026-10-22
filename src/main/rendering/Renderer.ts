import { Scene } from "../scene/Scene";

export interface Renderer {
    render(scene: Scene): void
}