const screen = document.getElementById('screen');

for (let row = 0; row < 192; row++) {
    for (let col = 0; col < 280; col++) {
        let x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.classList.add("pixel");
        x.id = `${row},${col}`;
        screen.appendChild(x);
    }

    let lineBreak = document.createElement("br");
    screen.appendChild(lineBreak);
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
