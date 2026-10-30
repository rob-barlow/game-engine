export default class AssetManager {
    imageMap: Map<string, HTMLImageElement>

    constructor(){
        this.load();
    }

    async load(){
        this.imageMap = new Map<string, HTMLImageElement>();

        const urls = ["./wall.jpg", "./water.jpg"];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            const image =  new Image();

            image.src = url
            await image.decode();
            this.imageMap.set(url, image);
        }
                
    }

    getImage(url: string): HTMLImageElement {
        return this.imageMap.get(url);
    }
}