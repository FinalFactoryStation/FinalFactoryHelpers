import { BlueprintView } from "./blueprint-view.js";


class InteractiveBlueprint extends BlueprintView {

    static async create(blueprintString, canvas, MAX_HEIGHT=1000, MAX_WIDTH=1000, canvasBackground=undefined, itemData=undefined, canvasBackgroundImg=undefined) {
        return InteractiveBlueprint.prototype.init.call(new InteractiveBlueprint(), blueprintString, canvas, MAX_HEIGHT, MAX_WIDTH, canvasBackground, itemData, canvasBackgroundImg);
    }

    async init(blueprintString, canvas, maxHeight, maxWidth, canvasBackground, itemData, canvasBackgroundImg) {
        await BlueprintView.prototype.init.call(this, blueprintString, canvas, maxHeight, maxWidth, canvasBackground, itemData, canvasBackgroundImg);

        this.canvas.addEventListener("mousemove", e => this.mouseMoveEventHandler(e));
        this.last = undefined;
        this.eventTarget = new EventTarget();


        this.eventXScale = this.canvas.width / this.canvas.clientWidth;
        this.eventYScale = this.canvas.height / this.canvas.clientHeight;

        return this;
    }

    findBox(x, y) {
        for (let i = 0; i < this.itemPaths.length; i++) {
            let box = this.itemPaths[i]
            if (this.ctx.isPointInPath(box, x, y)) {
                return this.items[i];
            }
        }
        return undefined;
    }

    mouseMoveEventHandler(event) {
        const item = this.findBox(event.offsetX * this.eventXScale, event.offsetY * this.eventYScale);
        if (this.last == item) {
            return;
        }
        if (this.last) {
            this.eventTarget.dispatchEvent(new CustomEvent('itemout', {detail: {item: this.last}}))
        }
        this.last = item;
        if (this.last) {
            this.eventTarget.dispatchEvent(new CustomEvent('itemover', {detail: {item: this.last}}))
        }
    }

    addEventListener(type, listener, options) {
        this.eventTarget.addEventListener(type, listener, options);
    }

}

export { InteractiveBlueprint }