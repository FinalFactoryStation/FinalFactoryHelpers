import { Base64 } from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.mjs';
import 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.es5.min.js';

const INFLATE_OPTIONS = { to: 'string' };

const decode = bps => JSON.parse(pako.inflate(Base64.toUint8Array(bps.substring(16)), INFLATE_OPTIONS));
const encode = obj => "ffblueprintstart"+Base64.fromUint8Array(pako.gzip(JSON.stringify(obj)))

const loadImage = filename => {
    return new Promise(resolve => {
        const img = new Image();
        img.src = filename;
        img.onload = () => {
            resolve(img);
        };
    });
}

const loadJson = f => fetch(f).then(response => response.json());

const windowSize = [ window.innerWidth, window.innerHeight ];

const path2D = Path2D;

export { decode, encode, loadImage, loadJson, windowSize, path2D }
