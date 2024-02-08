import * as wasm from "a2-pix";
let mouseDown = false;
// Set initial pixel size and color
const PIXEL_SIZE = 1;
let currentColor = "#000";

const thresholdSlider = document.getElementById("threshold");
let L_THRESHOLD = thresholdSlider.value;

thresholdSlider.addEventListener("change", e => {
    L_THRESHOLD = e.target.value;
    drawImage();
})

const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d");

function pixelsToWav(pixelArray) {
    const pixelBytes = pixelsToBytes(pixelArray);
    const pixelLoad = pixelsToMemory(pixelBytes);

    return wasm.bytes_to_wav(pixelLoad);
}

function pixelsToBytes(pixelArray) {
    let screen = [];
    for (let i = 0; i < pixelArray.length; i += 7) {
        let byte = 0;
        for (let j = 0; j < 7; j++) {
            byte += pixelArray[i + j] << j;
        }
        screen.push(byte);
    }
    return screen;
}

function pixelsToMemory(pixelBytes) {
    let mem = new Array(8192).fill(0);
    let i = 0;
    for (let band = 0; band < 3; band++) {
        for (let block_row = 0; block_row < 8; block_row++) {
            for (let pixel_row = 0; pixel_row < 8; pixel_row++) {
                for (let block_column = 0; block_column < 40; block_column++) {
                    let mem_offset = band * 0x28 + block_row * 0x80 + pixel_row * 0x400 + block_column;
                    mem[mem_offset] = pixelBytes[i];
                    i++;
                }
            }
        }
    }
    return mem;
}


function drawImage() {
    const imgSrc = document.getElementById("imgFile").files[0]
    const imageUrl = URL.createObjectURL(imgSrc);
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
        if (img.width > img.height) {
            ctx.drawImage(img, 0, 0, canvas.width, (canvas.width*img.height)/img.width)
        } else {
            const newWidth = (canvas.width*img.width)/img.height;
            const center = (canvas.width/2) - (newWidth / 2);
            ctx.drawImage(img, center,0, newWidth, canvas.width)
            
        }

        imageToBlackAndWhite()
    };
}

function imageToBlackAndWhite() {
    
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data

    for (let pixel = 0; pixel < data.length; pixel+=4) {
        const pixelData = data.slice(pixel, pixel+4);
        const newPixel = RGBAToHSLA(...pixelData);
        const L = newPixel[2];
        console.log(L_THRESHOLD);
        if (L > L_THRESHOLD) {
            data[pixel] = 255
            data[pixel+1] = 255
            data[pixel+2] = 255
            data[pixel+3] = 255
        }
        else {
            data[pixel] = 0
            data[pixel+1] = 0
            data[pixel+2] = 0
            data[pixel+3] = 255
        }
    }
    ctx.putImageData(imageData, 0, 0)
}

const RGBAToHSLA = (r, g, b, a) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2, a
    ];
  };

// Function to get pixel array
function getPixelArray() {
    const pixelArray = [];
    for (let y = 0; y < canvas.height; y += PIXEL_SIZE) {
        for (let x = 0; x < canvas.width; x += PIXEL_SIZE) {
            const pixelData = ctx.getImageData(x, y, PIXEL_SIZE, PIXEL_SIZE).data;
            const isPixelDrawn = pixelData.slice(0,3).some(value => value !== 0);
            pixelArray.push(isPixelDrawn ? 1 : 0);
        }
    }
    return pixelArray;
}

// Save button click event
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function () {
    const pixelArray = getPixelArray();

    let wavData = pixelsToWav(pixelArray);

    const wavBlob = new Blob([wavData], {type: "audio/wav"} );
    const wavBlobURL = URL.createObjectURL(wavBlob);

    const audio = new Audio(wavBlobURL);
    audio.play();
});


const submitImage = document.getElementById("submitImage");
submitImage.addEventListener("click", () => {
    drawImage();
})

// Handle mouse click events
canvas.addEventListener("mousedown", function (event) {
    mouseDown = true
    const x = Math.floor(event.offsetX / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor(event.offsetY / PIXEL_SIZE) * PIXEL_SIZE;

    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
});

document.body.addEventListener("mouseup", () => {
    mouseDown = false
})

canvas.addEventListener("mousemove", function (event) {
    if (mouseDown) {
        const x = Math.floor(event.offsetX / PIXEL_SIZE) * PIXEL_SIZE;
        const y = Math.floor(event.offsetY / PIXEL_SIZE) * PIXEL_SIZE;

        // console.log(x / pixelSize, y / pixelSize);

        ctx.fillStyle = currentColor;
        ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x+ PIXEL_SIZE, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x - PIXEL_SIZE, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x+ 2* PIXEL_SIZE, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x - 2* PIXEL_SIZE, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x, y + PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x, y - PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x, y + 2*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillRect(x, y - 2*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
})
