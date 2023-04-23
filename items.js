import { dir } from "./constants.js"
import { loadJson } from "./util.js";

const rotate = (sides, direction) => {
    const v = sides << (direction % 4);
    return (v & 15) + ((v & ~15) >> 4);
}

const rotate180 = sides => rotate(sides, 2);

const getInfo = (rawItem, index) => {
    const center_x = rawItem['OriginalPlacedPosition']['x'] / 10;
    const center_y = rawItem['OriginalPlacedPosition']['z'] / 10;
    const width = rawItem['Width'];
    const height = rawItem['Length'];

    return {
        width,
        height,
        direction: rawItem['CurrentDirection'],
        top: -Math.round(center_y + height / 2),
        bottom: -Math.round(center_y - height / 2),
        left: Math.round(center_x - width / 2),
        right: Math.round(center_x + width / 2),
        itemName: rawItem['ItemName'],
        index
    };
}

const readItems = j => {
    let index = 0;
    return j["Items"].map(rawItem => getInfo(rawItem, index++))
};

const readData = async url => {
    const itemData = await loadJson(url)
        .then(jsonData => Object.fromEntries(jsonData.items.map(item => [item.name, item])));
    const itemOverrides = await loadJson("overrides-" + url);
    for (const name in itemOverrides) {
        Object.assign(itemData[name], itemOverrides[name]);
    }

    const get = item => itemData[item.itemName];

    const connections = item => {
        const data = get(item);
        return rotate(data.connections ?? 0, item.direction);
    }

    const compatable = (value, name, categories) => (value == name) || categories.includes(value);

    const facing = item => rotate(dir.UP, item.direction);

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

    const accessible = (item1, item2, direction) => {
        const { slots = undefined } = get(item2);
        if (!slots) {
            return true;
        }

        // TODO update for 64 bits
        const match = (direction & dir.VERTICAL)
            ? (((1 << (item1.right - item1.left)) - 1) << (item1.left - item2.left))
            : (((1 << (item1.bottom - item1.top)) - 1) << (item1.top - item2.top));
        const slotMask = getMask(item2, slots, direction);
        console.log(slotMask + ":" + match); 0
        return (slotMask & match) == match;
    }

    const connects = (item1, item2, direction) => {
        const { connect, extend, chain, mate } = get(item1);
        const categories = get(item2).categories ?? [];
        if (compatable(connect, item2.itemName, categories)) {
            return accessible(item1, item2, direction);
        }
        if (compatable(extend, item2.itemName, categories)) {
            return direction & connections(item2);
        }
        if (compatable(chain, item2.itemName, categories)) {
            return facing(item1) != rotate180(facing(item2));
        }
        if (compatable(mate, item2.itemName, categories)) {
            return connections(item1) == rotate180(facing(item2));
        }
        return false;
    }

    const itemCategories = [...new Set(Object.values(itemData).map(obj => obj.itemCategory))];

    return { get, connections, connects, itemCategories, itemData };
}

const adjacent = (item1, item2) => {
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

const connected = (item1, item2, direction, itemData) => {
    const connections1 = itemData.connections(item1);
    if ((connections1 & direction) && itemData.connects(item1, item2, direction)) {
        return true;
    }
    const connections2 = itemData.connections(item2);
    const reversed = rotate180(direction);
    if ((connections2 & reversed) && itemData.connects(item2, item1, reversed)) {
        return true;
    }
    return false;
}

export { rotate, rotate180, readItems, readData, adjacent, connected };