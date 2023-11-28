import * as wasm from "a2-pix";

const screen = document.getElementById('screen');

// for (let row = 0; row < 192; row++) {
//     for (let col = 0; col < 280; col++) {
//         let x = document.createElement("INPUT");
//         x.setAttribute("type", "checkbox");
//         x.classList.add("pixel");
//         x.id = `${row},${col}`;
//         screen.appendChild(x);
//     }

//     let lineBreak = document.createElement("br");
//     screen.appendChild(lineBreak);
// }

function pixelsToWav(pixelArray) {
    return wasm.bytes_to_wav(pixelsToMemory(pixelArray));
}

function chunkRows(pixelByteArray) {
    let rows = [];
    for (let i = 0; i < pixelByteArray.length; i += 40) {
        rows.push(pixelByteArray.slice(i, i + 40));
    }
    return rows;
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

function readPixels() {
    const pixels = document.querySelectorAll('.pixel');
    const pixelArray = [];
    pixels.forEach((pixel, index) => {
        if (pixel.checked) {
            console.log(pixel.id);
        }
        pixelArray.push(pixel.checked ? 1 : 0);
    })
    let bytes = pixelsToBytes(pixelArray);
    let mem = pixelsToMemory(bytes);
    console.log(mem);
}

document.body.addEventListener('keypress', readPixels);

let mouseDown = false;

const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d");

// Set initial pixel size and color
const pixelSize = 4;
let currentColor = "#000";

// Initialize the grid
function initGrid() {
    for (let x = 0; x < canvas.width; x += pixelSize) {
        for (let y = 0; y < canvas.height; y += pixelSize) {
            // ctx.strokeRect(x, y, pixelSize, pixelSize);
        }
    }
}

// Handle mouse click events
canvas.addEventListener("mousedown", function (event) {
    const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
    const y = Math.floor(event.offsetY / pixelSize) * pixelSize;

    // console.log(x / pixelSize, y / pixelSize);

    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, pixelSize, pixelSize);
    // ctx.fillRect(x, y + pixelSize, pixelSize, pixelSize);
    // ctx.fillRect(x, y + pixelSize * 2, pixelSize, pixelSize);
});

document.body.addEventListener("mousedown", () => {
    mouseDown = true
})
document.body.addEventListener("mouseup", () => {
    mouseDown = false
})

canvas.addEventListener("mousemove", function (event) {
    if (mouseDown) {
        const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
        const y = Math.floor(event.offsetY / pixelSize) * pixelSize;

        console.log(x / pixelSize, y / pixelSize);

        ctx.fillStyle = currentColor;
        ctx.fillRect(x, y, pixelSize, pixelSize);
        // ctx.fillRect(x, y + pixelSize, pixelSize, pixelSize);
        // ctx.fillRect(x, y + pixelSize * 2, pixelSize, pixelSize);
    }
})

// Handle color selection
const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.addEventListener("input", function () {
    currentColor = colorPicker.value;
});

document.body.appendChild(colorPicker);

// Initialize the grid
initGrid();

// Function to get pixel array
function getPixelArray() {
    // const canvas = document.getElementById("pixelCanvas");
    const pixelArray = [];
    for (let y = 0; y < canvas.width; y += pixelSize) {
        for (let x = 0; x < canvas.height; x += pixelSize) {
            const pixelData = ctx.getImageData(x, y, pixelSize, pixelSize).data;
            const isPixelDrawn = pixelData.some(value => value !== 0);
            // if (isPixelDrawn) {
            //     console.log(pixelData);
            // }
            pixelArray.push(isPixelDrawn ? 1 : 0);
        }
    }
    return pixelArray;
}

// Save button click event
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function () {
    const pixelArray = getPixelArray();
    console.log(pixelArray);

    let wav = pixelsToWav(pixelArray);
    console.log(wav);
});
