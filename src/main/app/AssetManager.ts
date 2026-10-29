export default class AssetManager {
    imageMap: Map<string, HTMLImageElement>

    async load(){
        this.imageMap = new Map<string, HTMLImageElement>();

        const urls = ["./wall.jpg", "./water.jpg"];

        for (const url of urls){
            const image =  new Image();

            image.src = url;
            await image.decode();
            this.imageMap.set(url, image);
        }
                
    }

    getImage(url: string): HTMLImageElement {
        return this.imageMap.get(url);
    }
}