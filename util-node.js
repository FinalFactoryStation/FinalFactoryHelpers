import { inflate } from 'pako';
import { Path2D } from "path2d-polyfill";
import { loadImage } from "canvas";


const DEFLATE_OPTIONS = { to: 'string' };

const decode = bps => {
    const cleaned = bps.substring(16).replace(" ", "+");
    JSON.parse(inflate(Buffer.from(cleaned, 'base64'), DEFLATE_OPTIONS));
}

const loadJson = f => {
    console.log(f);
    let r = import("./" + f, {
        assert: {
            type: 'json'
        }
    });
    return r.then(m => m.default);
}

const windowSize = [ 500,500 ];

const path2D = Path2D;


export { decode, loadImage, loadJson, windowSize, path2D }
