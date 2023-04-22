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

export { decode, loadImage, loadJson, windowSize, path2D }
