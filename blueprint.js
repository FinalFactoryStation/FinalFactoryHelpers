import { dir, rotate } from "./constants.js"
import { decode, loadItemData } from "./util.js";



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

const connected = (item1, item2, direction) => {
console.log(item1)
    if ((item1.connections & direction) && connects(item1, item2, direction)) {
        return true;
    }
    const reversed = rotate180(direction);
    if ((item2.connections & reversed) && connects(item2, item1, reversed)) {
        return true;
    }
    return false;
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

class Station extends Set {
    constructor(item) {
        super([item])
        this.totalStabilityCost = item.data.stabilityCost;
        this.totalStabilityConferred = item.data.stabilityConferred + 15;
        this.totalPowerIdle = item.data.powerConsumptionIdle;
        this.totalPowerMax = item.data.powerConsumptionMax;
        this.totalPowerProduced = item.data.powerProduction;
        this.totalHeatRate = item.data.heatRate;
    }

    concat(other) {
        for (let i of other) {
            this.add(i);
        }
        this.totalStabilityCost += other.totalStabilityCost;
        this.totalStabilityConferred = Math.max(this.totalStabilityConferred, other.totalStabilityConferred);
        this.totalPowerIdle += other.totalPowerIdle;
        this.totalPowerMax += other.totalPowerMax;
        this.totalPowerProduced += other.totalPowerProduced;
        this.totalHeatRate += other.totalHeatRate;
    }
}

class Blueprint {


    async init(bp, itemData=undefined, items=undefined) {
        if (bp instanceof Blueprint) {
            return Blueprint.prototype.init.call(this, bp.blueprintString, bp.itemData, bp.items)
        }

        this.itemData = itemData ?? await loadItemData();
        if (!items) {
            const json = decode(bp);
            let index = 0;
            items = json["Items"].map(rawItem => createItem(rawItem, index++, this.itemData[rawItem['ItemName']]))
        }
        this.items = items;
        this.blueprintString = bp;


        this.itemCategories = [...new Set(Object.values(this.itemData).map(obj => obj.itemCategory))];

        const queue = [...this.items]
        this.itemConnections = Array.from({length: this.items.length}, () => new Set());
        this.itemStations = Array.from(this.items, item => new Station(item));
        this.connections = []

        while (queue.length) {
            let item = queue.shift();
            for (let other of queue) {
                const direction = adjacent(item, other)
                if (direction && connected(item, other, direction)) {
                    this.connections.push({
                        from: item, to: other, direction
                    });
                    this.itemConnections[item.index].add(other);
                    this.itemConnections[other.index].add(item);
                    const newStation = this.itemStations[item.index]
                    const oldStation = this.itemStations[other.index]
                    if (newStation !== oldStation) {
                        newStation.concat(oldStation)
                        for (let i of oldStation) {
                            this.itemStations[i.index] = newStation;
                        }
                    }
                }
            }
        }

        this.stations = new Set(this.itemStations);
console.log(this.connections)
        return this;
    }

    serialize() {
        return this.blueprintString;
    }

    static async create(blueprintString, itemData=undefined) {
        return await Blueprint.prototype.init.call(new Blueprint(), blueprintString, itemData);
    }

    async transform(transformation) {
        const newItems = this.items.map(transformation);
        return Blueprint.prototype.init.call(new Blueprint(), this.blueprintString, this.itemData, newItems);
    }

}


export { rotate, Blueprint };