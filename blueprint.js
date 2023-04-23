import { dir } from "./constants.js"
import { decode, loadItemData } from "./util.js";

const rotate = (directions, newDirection) => {
    const v = directions << (newDirection % 4);
    return (v & 15) + ((v & ~15) >> 4);
}

const rotate180 = sides => rotate(sides, 2);

const facing = item => rotate(dir.UP, item.direction)

const connects = (item1, item2, direction) => {
    const categories = item2.data.categories ?? [];
    if (compatable(item1.data.connect, item2.itemName, categories)) {
        return accessible(item1, item2, direction);
    }
    if (compatable(item1.data.extend, item2.itemName, categories)) {
        return direction & item2.connections;
    }
    if (compatable(item1.data.chain, item2.itemName, categories)) {
        return facing(item1) != rotate180(facing(item2));
    }
    if (compatable(item1.data.mate, item2.itemName, categories)) {
        return item1.connections == rotate180(facing(item2));
    }
    return false;
}

const compatable = (value, name, categories) => (value == name) || categories.includes(value);

const accessible = (item1, item2, direction) => {
    if (!item2.data.slots) {
        return true;
    }

    // TODO update for 64 bits
    const match = (direction & dir.VERTICAL)
        ? (((1 << (item1.right - item1.left)) - 1) << (item1.left - item2.left))
        : (((1 << (item1.bottom - item1.top)) - 1) << (item1.top - item2.top));
    const slotMask = getMask(item2, item2.data.slots, direction);
    console.log(slotMask + ":" + match); 0
    return (slotMask & match) == match;
}

const getMask = (item, slots, direction) => {
    switch (rotate(direction, 4 - item.direction)) {
        case dir.UP:
            return slots[0];
        case dir.RIGHT:
            return slots[2];
        case dir.DOWN:
            return slots[4];
        case dir.LEFT:
            return slots[6];
    }
    console.log("error")
}

const createItem = (rawItem, index, data) => {
    const center_x = rawItem['OriginalPlacedPosition']['x'] / 10;
    const center_y = rawItem['OriginalPlacedPosition']['z'] / 10;
    const width = rawItem['Width'];
    const height = rawItem['Length'];
    const direction = rawItem['CurrentDirection'];

    return Object.freeze({
        width,
        height,
        direction,
        top: -Math.round(center_y + height / 2),
        bottom: -Math.round(center_y - height / 2),
        left: Math.round(center_x - width / 2),
        right: Math.round(center_x + width / 2),
        itemName: rawItem['ItemName'],
        index,
        data,
        connections: rotate(data.connections ?? 0, direction)
    });
}

class Blueprint {

    static async create(blueprintString, itemData = undefined) {
        if (!itemData) {
            itemData = await loadItemData();
        }
        let index = 0;
        const json = decode(blueprintString);
        const items = json["Items"].map(rawItem => createItem(rawItem, index++, itemData[rawItem['ItemName']]))
        return new Blueprint(items, itemData, blueprintString);
    }

    adjacent(item1, item2) {
        if (item1.top == item2.bottom) {
            if ((item1.left - item2.left) * (item1.right - item2.right) <= 0) {
                return dir.UP;
            }
        } else if (item1.bottom == item2.top) {
            if ((item1.left - item2.left) * (item1.right - item2.right) <= 0) {
                return dir.DOWN;
            }
        } else if (item1.left == item2.right) {
            if ((item1.top - item2.top) * (item1.bottom - item2.bottom) <= 0) {
                return dir.LEFT;
            }
        } else if (item1.right == item2.left) {
            if ((item1.top - item2.top) * (item1.bottom - item2.bottom) <= 0) {
                return dir.RIGHT;
            }
        }
        return 0;
    }
    
    connected(item1, item2, direction) {
        if ((item1.connections & direction) && connects(item1, item2, direction)) {
            return true;
        }
        const reversed = rotate180(direction);
        if ((item2.connections & reversed) && connects(item2, item1, reversed)) {
            return true;
        }
        return false;
    }

    serialize() {
        return this.blueprintString;
    }

    constructor(items, itemData, blueprintString) {
        this.items = items;
        this.itemData = itemData;
        this.itemCategories = [...new Set(Object.values(itemData).map(obj => obj.itemCategory))];
        this.blueprintString = blueprintString;
    }
}


export { rotate, Blueprint };