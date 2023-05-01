import { inflate, gzip } from 'pako';
import { Path2D } from "path2d-polyfill";
import { loadImage } from "canvas";


const INFLATE_OPTIONS = { to: 'string' };

const decode = bps => JSON.parse(inflate(Buffer.from(bps.substring(16), "base64"), INFLATE_OPTIONS));
const encode = obj => "ffblueprintstart"+Buffer.from(gzip(Buffer.from(JSON.stringify(obj)))).toString('base64');

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


export { decode, encode, loadImage, loadJson, windowSize, path2D }
