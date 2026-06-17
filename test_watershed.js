import { WatershedStrategy } from './js/strategies/WatershedStrategy.js';

const width = 10;
const height = 10;
const pixelData = new Uint8ClampedArray(width * height * 4);
pixelData.fill(0); // background is black

// Create a single 6x6 square in the middle
for (let y = 2; y <= 7; y++) {
    for (let x = 2; x <= 7; x++) {
        const idx = (y * width + x) * 4;
        pixelData[idx] = 255;
        pixelData[idx + 1] = 255;
        pixelData[idx + 2] = 255;
        pixelData[idx + 3] = 255;
    }
}

// Instantiate and extract distance transform
const strategy = new WatershedStrategy();
// We can use a trick: register a steps callback and look at the distances step!
// Let's modify apply temporarily or just call the private method using eval / rewriting the test to include the distance transform function.

// Let's copy the distance transform code here to see what it outputs:
function distanceTransform(binary, width, height) {
    const dist = new Float32Array(width * height);
    const INF = 999999;
    
    // Inicializar: 0 para fondo, INF para objeto
    for (let i = 0; i < binary.length; i++) {
        dist[i] = binary[i] === 0 ? 0 : INF;
    }

    // Forward pass (arriba-izq a abajo-der)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (binary[idx] > 0) {
                let minNeighbor = dist[idx];
                
                // Vecinos ya procesados en forward pass
                if (x > 0) minNeighbor = Math.min(minNeighbor, dist[idx - 1] + 1);
                if (y > 0) {
                    minNeighbor = Math.min(minNeighbor, dist[idx - width] + 1);
                    if (x > 0) minNeighbor = Math.min(minNeighbor, dist[idx - width - 1] + 1);
                    if (x < width - 1) minNeighbor = Math.min(minNeighbor, dist[idx - width + 1] + 1);
                }
                
                dist[idx] = minNeighbor;
            }
        }
    }

    // Backward pass (abajo-der a arriba-izq)
    for (let y = height - 1; y >= 0; y--) {
        for (let x = width - 1; x >= 0; x--) {
            const idx = y * width + x;
            if (binary[idx] > 0) {
                let minNeighbor = dist[idx];
                
                // Vecinos restantes procesados en backward pass
                if (x < width - 1) minNeighbor = Math.min(minNeighbor, dist[idx + 1] + 1);
                if (y < height - 1) {
                    minNeighbor = Math.min(minNeighbor, dist[idx + width] + 1);
                    if (x < width - 1) minNeighbor = Math.min(minNeighbor, dist[idx + width + 1] + 1);
                    if (x > 0) minNeighbor = Math.min(minNeighbor, dist[idx + width - 1] + 1);
                }
                
                dist[idx] = minNeighbor;
            }
        }
    }

    return dist;
}

const binary = new Uint8Array(width * height);
for (let i = 0; i < binary.length; i++) {
    binary[i] = pixelData[i * 4] > 0 ? 255 : 0;
}

const dist = distanceTransform(binary, width, height);
console.log("Distance Transform Grid:");
for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
        const val = dist[y * width + x];
        row += (val === 999999 ? "I" : val) + " ";
    }
    console.log(row);
}
