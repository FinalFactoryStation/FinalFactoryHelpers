const styles = {
    DEFAULT_ITEM: {
        fill: "black",
        stroke: "black",
        strokeWidth: 0.03
    },
    HIGHLIGHT_STATION: {
        fill: "#414a4c",
        stroke: "green",
        strokeWidth: 0.03
    },
    HIGHLIGHT_ITEM: {
        fill: "#414a4c",
        stroke: "green",
        strokeWidth: 0.03
    }
}

const HFLIP_DIRECTION = [0, 3, 2, 1]
const VFLIP_DIRECTION = [2, 1, 0, 3]

const TRANSFORMATIONS = {
    HFLIP: item => ({
        width: item.width,
        height: item.height,
        direction: HFLIP_DIRECTION[item.direction],
        top: item.top,
        bottom: item.bottom,
        left: -item.right,
        right: -item.left,
        itemName: item.itemName,
        data: item.data,
        index: item.index,
        connections: rotate(item.data.connections ?? 0, HFLIP_DIRECTION[item.direction])
    }),    
    VFLIP: item => ({
        width: item.width,
        height: item.height,
        direction: VFLIP_DIRECTION[item.direction],
        top: -item.bottom,
        bottom: -item.top,
        left: item.left,
        right: item.right,
        itemName: item.itemName,
        data: item.data,
        index: item.index,
        connections: rotate(item.data.connections ?? 0, VFLIP_DIRECTION[item.direction])
    }),
    CLOCKWISE: item => ({
        width: item.height,
        height: item.width,
        direction: (item.direction+1)%4,
        top: item.left,
        bottom: item.right,
        left: -item.bottom,
        right: -item.top,
        itemName: item.itemName,
        data: item.data,
        index: item.index,
        connections: rotate(item.data.connections ?? 0, (item.direction+1)%4)
    }),
    COUNTER_CLOCKWISE: item => ({
        width: item.height,
        height: item.width,
        direction: (item.direction-1)%4,
        top: -item.right,
        bottom: -item.left,
        left: item.top,
        right: item.bottom,
        itemName: item.itemName,
        data: item.data,
        index: item.index,
        connections: rotate(item.data.connections ?? 0, (item.direction-1)%4)
    })
}

const dir = {
    UP: 0b1,
    RIGHT: 0b10,
    DOWN: 0b100,
    LEFT: 0b1000,
    
    ANY: 0b1111, // UP + RIGHT + DOWN + LEFT
    HORIZONTAL: 0b1010, // RIGHT + LEFT
    VERTICAL: 0b0101 // UP + DOWN
}

const rotate = (directions, newDirection) => {
    const v = directions << (newDirection % 4);
    return (v & 15) + ((v & ~15) >> 4);
}

const sources = {
    ITEMS_DATA_URL: "itemData.json",
    OVERRIDES_URL: "overrides-itemData.json",
}

const DEFAULT_CANVAS_BACKGROUND = "grey";

export { styles, dir, sources, DEFAULT_CANVAS_BACKGROUND, TRANSFORMATIONS, rotate }