import { loadImage, windowSize, path2D } from "./util.js";
import { dir } from "./constants.js"
// import { adjacent, connected } from "./blueprint.js";

const BACKGROUND_DEFAULT = "black";
const BACKGROUND_HIGHLIGHT = "#414a4c";
const CANVAS_BACKGROUND = "grey";
const NO_CONNECT_BACKGROUND = "red"
const CONNECT_BACKGROUND = "midnightblue"

const STROKE_HIGHLIGHT = "green";
const WIDTH_STROKE = .03;
const STOKE_DEFAULT = "black";



const UNCONNECT_SIZE = 0.04;
const MARGIN_ITEM = UNCONNECT_SIZE + WIDTH_STROKE - 0.02;

const HIGHLIGHTED = 1;


// const HFLIP_TRANSFORM = item => ({
//     width: item.width,
//     height: item.height,
//     direction: hflip(item.direction),
//     top: item.top,
//     bottom: item.bottom,
//     left: -item.left,
//     right: -item.right,
//     itemName: item.itemName
// });

// const CLOCKWISE_TRANSFORM = item => ({
//     width: item.height,
//     height: item.width,
//     direction: rotate(item.direction, 1),
//     top: -item.left,
//     bottom: -item.right,
//     left: -item.top,
//     right: -item.bottom,
//     itemName: item.itemName
// });

// const COUNTERCLOCKWISE_TRANSFORM = item => ({
//     width: item.height,
//     height: item.width,
//     direction: rotate(item.direction, 1),
//     top: item.right,
//     bottom: item.left,
//     left: item.bottom,
//     right: item.top,
//     itemName: item.itemName
// });




const makeRender = (canvas, blueprint, boundingBox, scalingFactor) => {
    canvas.width = (boundingBox.right - boundingBox.left) * scalingFactor;
    canvas.height = (boundingBox.bottom - boundingBox.top) * scalingFactor;

    const eventXScale = canvas.width / canvas.clientWidth;
    const eventYScale = canvas.height / canvas.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = CANVAS_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { top, left } = boundingBox;

    const boxes = [];

    const drawRect = (rtop, rbottom, rleft, rright, fill, stroke) => {
        const box = new path2D();
        box.rect(
            (rleft - left) * scalingFactor,
            (rtop - top) * scalingFactor,
            (rright - rleft) * scalingFactor,
            (rbottom - rtop) * scalingFactor,
            0.5 + scalingFactor);
        ctx.fillStyle = fill;
        ctx.fill(box);
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = WIDTH_STROKE * scalingFactor;
            ctx.stroke(box);
        }
        return box;
    }


    const drawBox = (item, state) => {
        const stroke = state == HIGHLIGHTED ? STROKE_HIGHLIGHT : STOKE_DEFAULT;
        const fill = state == HIGHLIGHTED ? BACKGROUND_HIGHLIGHT : BACKGROUND_DEFAULT;
        const box = drawRect(item.top + MARGIN_ITEM, item.bottom - MARGIN_ITEM, item.left + MARGIN_ITEM, item.right - MARGIN_ITEM, fill, stroke);
        boxes.push(box);
        const center = (item.left + item.right) / 2;
        const middle = (item.top + item.bottom) / 2;
        if (item.connections & dir.UP) {
            drawRect(item.top, item.top + UNCONNECT_SIZE, center - UNCONNECT_SIZE, center + UNCONNECT_SIZE, NO_CONNECT_BACKGROUND);
        }
        if (item.connections & dir.DOWN) {
            drawRect(item.bottom - +UNCONNECT_SIZE, item.bottom, center - UNCONNECT_SIZE, center + UNCONNECT_SIZE, NO_CONNECT_BACKGROUND);
        }
        if (item.connections & dir.LEFT) {
            drawRect(middle - UNCONNECT_SIZE, middle + UNCONNECT_SIZE, item.left, item.left + UNCONNECT_SIZE, NO_CONNECT_BACKGROUND);
        }
        if (item.connections & dir.RIGHT) {
            drawRect(middle - UNCONNECT_SIZE, middle + UNCONNECT_SIZE, item.right - UNCONNECT_SIZE, item.right, NO_CONNECT_BACKGROUND);
        }
    }


    // const wordWrap = (text, width)

    const drawLabel = item => {
        const width = (item.right - item.left) * scalingFactor;
        const size = Math.round(scalingFactor / 5);
        const labelY = (item.top - top) * scalingFactor + size;
        ctx.font = size + "px Arial";
        ctx.fillStyle = "white";
        const words = item.itemName.split(' ');
        let line = '';
        let lines = [];
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = ctx.measureText(testLine).width;
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
            const labelWidth = ctx.measureText(lines[i]).width;
            ctx.fillText(lines[i], (item.left - left) * scalingFactor + width / 2 - labelWidth / 2, labelY + i * size);
        }
    }


    const drawImage = async item => {
        let x = (item.left - left) * scalingFactor;
        let y = (item.top - top) * scalingFactor;
        let width = item.width * scalingFactor;
        let height = item.height * scalingFactor;

        const img = await loadImage(`Icons/${item.itemName.replace(/\s/g, '')}.png`);
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
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    }

    const render = async (item, state) => {
        drawBox(item, state);
        await drawImage(item);
        drawLabel(item);
    };

    const renderAdjacent = (item1, item2, direction) => {
        switch (direction) {
            case (dir.UP):
                drawRect(item1.top - UNCONNECT_SIZE, item1.top + UNCONNECT_SIZE, Math.max(item1.left, item2.left) + UNCONNECT_SIZE, Math.min(item1.right, item2.right) - UNCONNECT_SIZE, CONNECT_BACKGROUND)
                break;
            case (dir.LEFT):
                drawRect(Math.max(item1.top, item2.top) + UNCONNECT_SIZE, Math.min(item1.bottom, item2.bottom) - UNCONNECT_SIZE, item1.left - UNCONNECT_SIZE, item1.left + UNCONNECT_SIZE, CONNECT_BACKGROUND)
                break;
            case (dir.DOWN):
                drawRect(item1.bottom - UNCONNECT_SIZE, item1.bottom + UNCONNECT_SIZE, Math.max(item1.left, item2.left) + UNCONNECT_SIZE, Math.min(item1.right, item2.right) - UNCONNECT_SIZE, CONNECT_BACKGROUND)
                break;
            case (dir.RIGHT):
                drawRect(Math.max(item1.top, item2.top) + UNCONNECT_SIZE, Math.min(item1.bottom, item2.bottom) - UNCONNECT_SIZE, item1.right - UNCONNECT_SIZE, item1.right + UNCONNECT_SIZE, CONNECT_BACKGROUND)
                break;
        }
    };


    const findBox = (x, y, items) => {
        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i]
            if (ctx.isPointInPath(box, x, y)) {
                return items[i];
            }
        }
        return undefined;
    }

    let highlighed = undefined;
    const mouseMoveEventHandler = (event, items) => {
        const item = findBox(event.offsetX * eventXScale, event.offsetY * eventYScale, items);
        if (highlighed == item) {
            return;
        }
        if (highlighed) {
            render(highlighed)
        }
        highlighed = item;
        if (highlighed) {
            render(highlighed, HIGHLIGHTED)
        }
    }

    return { render, renderAdjacent, mouseMoveEventHandler };

}

const mergeBox = (item1, item2) => ({
    top: Math.min(item1.top, item2.top),
    bottom: Math.max(item1.bottom, item2.bottom),
    left: Math.min(item1.left, item2.left),
    right: Math.max(item1.right, item2.right),
})

const VOID_BOX = {
    top: Infinity,
    bottom: -Infinity,
    left: Infinity,
    right: -Infinity,
}

const calculateBoundingBox = items => {
    return items.reduce(mergeBox, VOID_BOX)
}

const calculateTotals = (items, itemData) => {
    let totalStabilityCost = 0,
        totalPowerIdle = 0,
        totalPowerMax = 0,
        totalPowerProduced = 0,
        totalHeatRate = 0,
        totalStabilityConferred = 15,
        totalItems = 0;

    items.forEach(box => {
        let itemInfo = itemData.get(box);
        if (!itemInfo) {
            console.log("ERROR: No item info for " + box.itemName);
        } else {
            totalStabilityCost += itemInfo.stabilityCost;
            totalStabilityConferred = Math.max(totalStabilityConferred, itemInfo.stabilityConferred + 15);
            totalPowerIdle += itemInfo.powerConsumptionIdle;
            totalPowerMax += itemInfo.powerConsumptionMax;
            totalPowerProduced += itemInfo.powerProduction;
            totalHeatRate += itemInfo.heatRate;
            totalItems += 1;
        }
    });

    return {
        totalStabilityCost,
        totalPowerIdle,
        totalPowerMax,
        totalPowerProduced,
        totalHeatRate,
        totalStabilityConferred,
        totalItems
    };
}


// Draw label

async function drawBoxes(canvas, blueprint, MAX_HEIGHT=1000, MAX_WIDTH=1000) {

    // Calculate the bounding box of the items
    const boundingBox = calculateBoundingBox(blueprint.items);

    // Get the dimensions of the bounding box and the window
    const { left, right, top, bottom } = boundingBox;
    const boundingBoxWidth = right - left;
    const boundingBoxHeight = bottom - top;
    const [windowWidth, windowHeight] = windowSize;

    // Calculate the aspect ratios of the bounding box and the window
    const boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    // Calculate the scaling factor based on the aspect ratios and the maximum dimensions
    let scalingFactor = boundingBoxAspectRatio > windowAspectRatio
        ? Math.min(MAX_HEIGHT / boundingBoxHeight, windowHeight / boundingBoxHeight) // If bounding box is taller than the window, limit by height
        : Math.min(MAX_WIDTH / boundingBoxWidth, windowWidth / boundingBoxWidth); // Otherwise, limit by width

    // If the scaled height exceeds the maximum height, scale down based on height
    if (scalingFactor * boundingBoxHeight > MAX_HEIGHT) {
        scalingFactor = MAX_HEIGHT / boundingBoxHeight;
    }

    // If the scaled width exceeds the maximum width, scale down based on width
    if (scalingFactor * boundingBoxWidth > MAX_WIDTH) {
        scalingFactor = MAX_WIDTH / boundingBoxWidth;
    }

    // Calculate the scaled dimensions using the scaling factor
    const scaledWidth = boundingBoxWidth * scalingFactor;
    const scaledHeight = boundingBoxHeight * scalingFactor;

    // Log the scaled dimensions to the console
    console.log(`Scaled width: ${scaledWidth}px`);
    console.log(`Scaled height: ${scaledHeight}px`);


    const view = makeRender(canvas, blueprint, boundingBox, scalingFactor);

    for (let item of blueprint.items) {
        await view.render(item);
    }

    // const itemsWithId = blueprint.items.map((item, index) => {
    //     return {
    //         index: index,
    //         item: item
    //     };
    // });

    // const parent = {};
    // for (let item of itemsWithId) {
    //     parent[item.index] = item.index;
    // }

    // function find(item) {
    //     if (parent[item.index] === item.index) {
    //         return item.index;
    //     }
    //     return find({ index: parent[item.index], item: item.item });
    // }

    // function union(item1, item2) {
    //     const root1 = find(item1);
    //     const root2 = find(item2);
    //     parent[root2] = root1;
    // }

    const queue = [...blueprint.items]
    while (queue.length) {
        let item = queue.shift();
        for (let other of queue) {
            const direction = blueprint.adjacent(item, other)
            if (direction && blueprint.connected(item, other, direction)) {
                view.renderAdjacent(item, other, direction);
                // union(item, i);
            }
        }
    }

    // function extractGroups(parent) {
    //     const groups = {};
    //     for (let i in parent) {
    //         let item = items[i]
    //         const root = find({ index: i, item: item });
    //         if (groups[root]) {
    //             groups[root].push(item);
    //         } else {
    //             groups[root] = [item];
    //         }
    //     }
    //     return Object.values(groups);
    // }

    // let allGroups = extractGroups(parent);
    // console.log(allGroups);
    // let stationGroups = allGroups.map(group => group.filter(item => itemData.get(item).itemCategory === "Stations")).filter(group => group.length > 0);

    return {
        "mouseMoveEventHandler": event => view.mouseMoveEventHandler(event, blueprint.items)
        // "stationGroupTotals": stationGroups.map(group => calculateTotals(group, itemData))
    }

}


export { drawBoxes }