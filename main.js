import { Base64 } from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.mjs';
import 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js';


const DEFLATE_OPTIONS = {to: 'string'};

const decode = bps => JSON.parse(pako.inflate(Base64.toUint8Array(bps.substring(16)), DEFLATE_OPTIONS));

const readItems = j => j["Items"].map(get_rotated_object_info);



const get_rotated_object_info = obj => {
    const center_x = obj['OriginalPlacedPosition']['z'] / 10;
    const center_y = obj['OriginalPlacedPosition']['x'] / 10;
    const width = obj['Length'];
    const height = obj['Width'];

    return {
        center_x,
        center_y,
        width,
        height,
        direction: obj['CurrentDirection'],
        top: center_y - height / 2,
        bottom: center_y + height / 2,
        left: center_x - width / 2,
        right: center_x + width / 2,
        itemName: obj['ItemName']
    };
}


const makeRender = (canvas, itemData, boundingBox, scalingFactor) => {
    canvas.width = (boundingBox.right - boundingBox.left) * scalingFactor;
    canvas.height = (boundingBox.bottom - boundingBox.top) * scalingFactor;

    const ctx = canvas.getContext("2d");
    const {top, left} = boundingBox;


    const drawRect = (ctx, item, x, y, width, height) => {
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
    };
    




    return item => {
        let x = (item.left - left) * scalingFactor;
        let y = (item.top - top) * scalingFactor;
        let width = item.width * scalingFactor;
        let height = item.height * scalingFactor;
        drawRect(ctx, item, x, y, width, height);
        addImage(ctx, item, x, y, width, height);
    };
    
}



  // Add image
  function addImage(ctx, box, x, y, width, height) {

    const img = new Image();
    img.src = `Icons/${box.itemName.replace(/\s/g, '')}.png`;
    img.onload = () => {
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
      drawLabel(ctx, box.itemName, x, y, width, height);
    };
  }

  // Draw label
  function drawLabel(ctx, label, x, y, width, height) {
    const labelY = y + 48;
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    const words = label.split(' ');
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
    for (let i = 0; i < lines.length; i++) {
      const labelWidth = ctx.measureText(lines[i]).width;
      ctx.fillText(lines[i], x + width / 2 - labelWidth / 2, labelY + i * 48);
    }
  }

  function drawBoxes(canvas, items, itemData) {

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const padding = 10;
    const minBoxSize = 50;
    const aspectRatio = 16 / 9; // Set the aspect ratio of the canvas
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const canvasWidth = windowWidth - padding * 2;
    const canvasHeight = windowHeight - padding * 2;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    const scalingFactor = canvasAspectRatio > aspectRatio
      ? canvasHeight / (Math.max(...items.map(b => b.height)) * 1.1)
      : canvasWidth / (Math.max(...items.map(b => b.width)) * 1.1);

    const render = makeRender(canvas, itemData, boundingBox(items), scalingFactor);
    for (let items of items) {
        render(items);
    }
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

const boundingBox = items => {
    return items.reduce(mergeBox, VOID_BOX)
}

export { decode, drawBoxes, get_rotated_object_info, readItems }