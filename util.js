import { sources } from "./constants.js";

const RUNTIME = globalThis.process?.release?.name || 'browser'
const DEFLATE_OPTIONS = { to: 'string' };


let decode, loadImage, loadJson, windowSize, path2D;

if (RUNTIME == "node") {
    ({ decode, loadImage, loadJson, windowSize, path2D } = await import("./util-node.js"));
} else if (RUNTIME == "browser") {
    ({ decode, loadImage, loadJson, windowSize, path2D } = await import("./util-browser.js"));
} else {
    throw new Error("unreasonable runtime: " + RUNTIME) 
}


const loadItemData = async () => {
    const itemData = await loadJson(sources.ITEMS_DATA_URL)
        .then(jsonData => Object.fromEntries(jsonData.items.map(item => [item.name, item])));
    const itemOverrides = await loadJson(sources.OVERRIDES_URL);
    for (const name in itemOverrides) {
        Object.assign(itemData[name], itemOverrides[name]);
    }
    return itemData;
}

export { decode, loadImage, loadJson, windowSize, path2D, loadItemData }
