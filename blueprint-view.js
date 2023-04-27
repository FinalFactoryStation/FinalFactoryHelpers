import { Blueprint } from "./blueprint.js";
import { windowSize, path2D, loadImage } from "./util.js";
import { dir, DEFAULT_CANVAS_BACKGROUND } from "./constants.js";

const ITEM_MARGIN = 0.1;

// const wordWrap = (text, width)

const imageCache = {};

const getImage = async filename => {
    if (!(filename in imageCache)) {
        imageCache[filename] = loadImage(filename)
    }
    return await imageCache[filename];
}

const mergeBox = (item1, item2) => ({
    top: Math.min(item1.top, item2.top),
    bottom: Math.max(item1.bottom, item2.bottom),
    left: Math.min(item1.left, item2.left),
    right: Math.max(item1.right, item2.right),
});

const VOID_BOX = {
    top: Infinity,
    bottom: -Infinity,
    left: Infinity,
    right: -Infinity,
};

const calculateBoundingBox = items => {
    return items.reduce(mergeBox, VOID_BOX)
};

class BlueprintView extends Blueprint {
    makeItemPath(item) {
        const path = new path2D();
        path.rect(
            (item.left - this.xoffset + ITEM_MARGIN) * this.scalingFactor,
            (item.top - this.yoffset + ITEM_MARGIN) * this.scalingFactor,
            (item.right - item.left - ITEM_MARGIN) * this.scalingFactor,
            (item.bottom - item.top - ITEM_MARGIN) * this.scalingFactor,
            0.5 + this.scalingFactor);
        return path;
    }



    drawLabel(item) {
        const width = (item.right - item.left) * this.scalingFactor;
        const size = Math.round(this.scalingFactor / 5);
        const labelY = (item.top - this.yoffset  + ITEM_MARGIN) * this.scalingFactor + size;
        this.ctx.font = size + "px Arial";
        this.ctx.fillStyle = "white";
        const words = item.itemName.split(' ');
        let line = '';
        let lines = [];
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = this.ctx.measureText(testLine).width;
            if (testWidth > width - 20) {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        lines = lines.filter(l => !!l)
        for (let i = 0; i < lines.length; i++) {
            const labelWidth = this.ctx.measureText(lines[i]).width;
            this.ctx.fillText(lines[i], (item.left - this.xoffset) * this.scalingFactor + width / 2 - labelWidth / 2, labelY + i * size);
        }
    }
    
    async drawImage(item) {
        let x = (item.left - this.xoffset) * this.scalingFactor;
        let y = (item.top - this.yoffset) * this.scalingFactor;
        let width = item.width * this.scalingFactor;
        let height = item.height * this.scalingFactor;
    
        const img = await getImage(`Icons/${item.itemName.replace(/\s/g, '')}.png`);
        const imgAspect = img.width / img.height;
        const boxAspect = width / height;
        let imgWidth = width;
        let imgHeight = height;
        if (imgAspect > boxAspect) {
            imgWidth = Math.min(width, img.width);
            imgHeight = imgWidth / imgAspect;
        } else {
            imgHeight = Math.min(height, img.height);
            imgWidth = imgHeight * imgAspect;
        }
        const imgX = x + (width - imgWidth) / 2;
        const imgY = y + (height - imgHeight) / 2;
        this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    }

    stylePath(path, style) {
        if (style.fill) {
            this.ctx.fillStyle = style.fill;
            this.ctx.fill(path);
        }
        if (style.strokeWidth) {
            this.ctx.strokeStyle = style.stroke;
            this.ctx.lineWidth = style.strokeWidth * this.scalingFactor;
            this.ctx.stroke(path);
        }
    }

    drawConnection(top, left, bottom, right, vertPadding, horizPadding, style) {
        this.ctx.rect(
            (left - this.xoffset - 2*horizPadding) * this.scalingFactor,
            (top - this.yoffset - 2*vertPadding) * this.scalingFactor,
            (right - left + 3*horizPadding) * this.scalingFactor,
            (bottom - top + 3*vertPadding) * this.scalingFactor);
        this.ctx.fillStyle = style.fill;
        this.ctx.fill();
        if (style.strokeWidth) {
            this.ctx.strokeStyle = style.stroke;
            this.ctx.lineWidth = style.strokeWidth * this.scalingFactor;
            this.ctx.stroke();
        }

    }

    static async create(blueprintString, canvas, MAX_HEIGHT=1000, MAX_WIDTH=1000, canvasBackground=undefined, itemData=undefined) {
        return BlueprintView.prototype.init.call(new BlueprintView(), blueprintString, canvas, MAX_HEIGHT, MAX_WIDTH, canvasBackground, itemData);
    }

    async init(blueprintString, canvas, maxHeight, maxWidth, canvasBackground, itemData) {
        await Blueprint.prototype.init.call(this, blueprintString, itemData);

        this.canvas = canvas;

        // Get the dimensions of the bounding box and the window
        const { left, right, top, bottom } = calculateBoundingBox(this.items);
        const boundingBoxWidth = right - left;
        const boundingBoxHeight = bottom - top;
        const [windowWidth, windowHeight] = windowSize;
    
        // Calculate the aspect ratios of the bounding box and the window
        const boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight;
        const windowAspectRatio = windowWidth / windowHeight;
    
        // Calculate the scaling factor based on the aspect ratios and the maximum dimensions
        this.scalingFactor = boundingBoxAspectRatio > windowAspectRatio
            ? Math.min(maxHeight / boundingBoxHeight, windowHeight / boundingBoxHeight) // If bounding box is taller than the window, limit by height
            : Math.min(maxWidth / boundingBoxWidth, windowWidth / boundingBoxWidth); // Otherwise, limit by width
    
        // If the scaled height exceeds the maximum height, scale down based on height
        if (this.scalingFactor * boundingBoxHeight > maxHeight) {
            this.scalingFactor = maxHeight / boundingBoxHeight;
        }
    
        // If the scaled width exceeds the maximum width, scale down based on width
        if (this.scalingFactor * boundingBoxWidth > maxWidth) {
            this.scalingFactor = maxWidth / boundingBoxWidth;
        }

        this.canvas.width = (right - left) * this.scalingFactor;
        this.canvas.height = (bottom - top) * this.scalingFactor;
    
    
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = canvasBackground ?? DEFAULT_CANVAS_BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.xoffset = left;
        this.yoffset = top;
    
        this.itemPaths = this.items.map(item => this.makeItemPath(item));

        return this;
    }

    async styleItem(item, style) {
        this.stylePath(this.itemPaths[item.index], style);
        await this.drawImage(item);
        this.drawLabel(item);
    }

    async style(style) {
        for (let item of this.items) {
            await this.styleItem(item, style);
        }
    }

    styleConnection(item1, item2, direction, style) {
        switch (direction) {
            case (dir.UP):
                return this.drawConnection(item1.top, Math.max(item1.left, item2.left), 
                    item1.top, Math.min(item1.right, item2.right), 
                    ITEM_MARGIN, -ITEM_MARGIN, style)
            case (dir.LEFT):
                return this.drawConnection(Math.max(item1.top, item2.top), item1.left, 
                    Math.min(item1.bottom, item2.bottom), item1.left, 
                    -ITEM_MARGIN, ITEM_MARGIN, style)
            case (dir.DOWN):
                return this.drawConnection(item1.bottom, Math.max(item1.left, item2.left), 
                    item1.bottom,  Math.min(item1.right, item2.right), 
                    ITEM_MARGIN, -ITEM_MARGIN, style)
            case (dir.RIGHT):
                return this.drawConnection(Math.max(item1.top, item2.top), item1.right, 
                    Math.min(item1.bottom, item2.bottom), item1.right, 
                    -ITEM_MARGIN, ITEM_MARGIN, style)
        }
    }

    styleConnections(style) {
        this.connections.forEach(c => this.styleConnection(c.from, c.to, c.direction, style));
    }
}



export { BlueprintView };