/**
 * Estrategia de Watershed para imágenes binarias
 * Segmenta objetos separando regiones mediante morfología limpia
 * * Pasos:
 * 1. Distance Transform: calcula distancia al fondo
 * 2. Mínimos Locales: identifica semillas de crecimiento
 * 3. Etiquetado: asigna labels a cada región de forma sólida
 * 4. Inundación: expande desde mínimos garantizando un color único por cuenca
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class WatershedStrategy extends BaseStrategy {
    constructor() {
        super();
        this.stepsCallback = null; // Callback para mostrar pasos
    }

    getDescription() {
        return "Algoritmo de Watershed para segmentación de imágenes binarias. Identifica y separa objetos diferenciados mediante distancias morfológicas.\n\n" +
            "1. Distance Transform: calcula la distancia de cada píxel al fondo (0).\n" +
            "2. Mínimos Locales: encuentra puntos de mínima distancia en cada objeto.\n" +
            "3. Etiquetado: asigna identificadores únicos a cada región.\n" +
            "4. Inundación: expande desde mínimos para crear bordes entre objetos.";
    }

    getFormula() {
        return "Distance Transform (Distancia Euclidiana)";
    }

    getFormulaLatex() {
        return String.raw`d(p) = \sqrt{(x_p - x_0)^2 + (y_p - y_0)^2}`;
    }

    getControls() {
        return `<p>Watershed segmenta automáticamente objetos binarios sin parámetros ajustables. Los pasos del algoritmo se muestran en una ventana interactiva.</p>`;
    }

    /**
     * Aplica Watershed a datos de imagen
     * @param {Uint8ClampedArray} pixelData - RGBA data
     * @param {number} width
     * @param {number} height
     * @returns {Uint8ClampedArray} - Imagen segmentada con labels coloreados
     */
    apply(pixelData, width, height) {
        const steps = [];

        // Paso 1: Crear mapa binario (solo canal rojo)
        const binary = this.#extractBinary(pixelData, width, height);
        steps.push({ title: 'Imagen Binaria', data: this.#binaryToRGBA(binary, width, height) });

        // Paso 2: Distance Transform
        const distances = this.#distanceTransform(binary, width, height);
        steps.push({ title: 'Distance Transform', data: this.#distancesToRGBA(distances, width, height) });

        // Paso 3: Encontrar mínimos locales (semillas)
        const seeds = this.#findLocalMinima(distances, width, height);
        steps.push({ title: 'Mínimos Locales (Semillas)', data: this.#seedsToRGBA(seeds, width, height, distances) });

        // Paso 4: Etiquetar y llenar (Watershed) con colores sólidos
        const labels = this.#watershedFill(distances, seeds, width, height);
        steps.push({ title: 'Etiquetado de Regiones', data: this.#labelsToRGBA(labels, width, height) });

        // Paso 5: Crear bordes
        const result = this.#createWatersheds(labels, width, height);

        // Invocar callback con todos los pasos
        if (this.stepsCallback) {
            this.stepsCallback(steps, result);
        }

        return result;
    }

    /**
     * Extrae mapa binario del canal rojo (255 = objeto, 0 = fondo)
     */
    #extractBinary(pixelData, width, height) {
        const binary = new Uint8Array(width * height);

        let minVal = 255, maxVal = 0;
        for (let i = 0; i < pixelData.length; i += 4) {
            const gray = pixelData[i];
            minVal = Math.min(minVal, gray);
            maxVal = Math.max(maxVal, gray);
        }

        if (maxVal === minVal) {
            binary.fill(0);
            return binary;
        }

        const threshold = (minVal + maxVal) / 2;

        for (let i = 0; i < pixelData.length; i += 4) {
            const gray = pixelData[i];
            binary[i / 4] = gray > threshold ? 255 : 0;
        }

        return binary;
    }

    #distanceTransform(binary, width, height) {
        const dist = new Float32Array(width * height);
        const INF = 999999;

        for (let i = 0; i < binary.length; i++) {
            dist[i] = binary[i] === 0 ? 0 : INF;
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (binary[idx] > 0) {
                    let minNeighbor = dist[idx];

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

        for (let y = height - 1; y >= 0; y--) {
            for (let x = width - 1; x >= 0; x--) {
                const idx = y * width + x;
                if (binary[idx] > 0) {
                    let minNeighbor = dist[idx];

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

    /**
     * Encuentra mínimos locales (picos de la transformada de distancia)
     */
    #findLocalMinima(distances, width, height) {
        const seeds = [];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;

                if (distances[idx] > 0) {
                    const val = distances[idx];
                    let isMaximum = true;

                    for (let dy = -1; dy <= 1 && isMaximum; dy++) {
                        for (let dx = -1; dx <= 1 && isMaximum; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nidx = (y + dy) * width + (x + dx);
                            if (distances[nidx] > val) {
                                isMaximum = false;
                            }
                        }
                    }

                    if (isMaximum) {
                        seeds.push({ x, y, distance: val });
                    }
                }
            }
        }

        return seeds;
    }

    /**
     * Inundación Watershed modificada para garantizar regiones sólidas de un único color
     */
    #watershedFill(distances, seeds, width, height) {
        const labels = new Int32Array(width * height);
        labels.fill(-1);

        if (seeds.length === 0) {
            let maxDist = 0, maxIdx = 0;
            for (let i = 0; i < distances.length; i++) {
                if (distances[i] > maxDist && distances[i] < 999999) {
                    maxDist = distances[i];
                    maxIdx = i;
                }
            }
            if (maxDist > 0) {
                seeds.push({ x: maxIdx % width, y: Math.floor(maxIdx / width), distance: maxDist });
            }
        }

        let maxDist = 0;
        for (let i = 0; i < distances.length; i++) {
            if (distances[i] > maxDist && distances[i] < 999999) {
                maxDist = Math.ceil(distances[i]);
            }
        }

        const buckets = Array.from({ length: maxDist + 1 }, () => []);

        seeds.forEach((seed, idx) => {
            const seedIdx = seed.y * width + seed.x;
            labels[seedIdx] = idx;
            const distVal = Math.min(maxDist, Math.max(1, Math.round(seed.distance)));
            buckets[distVal].push({ x: seed.x, y: seed.y });
        });

        for (let d = maxDist; d >= 1; d--) {
            const queue = buckets[d];
            let qIdx = 0;
            while (qIdx < queue.length) {
                const current = queue[qIdx++];
                const currentIdx = current.y * width + current.x;
                const currentLabel = labels[currentIdx];

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = current.x + dx;
                        const ny = current.y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nidx = ny * width + nx;

                            // CONDICIÓN CRÍTICA FIJADA: Solo se propaga la etiqueta de la cuenca si el píxel
                            // pertenece al cuerpo del objeto (dist > 0) y no ha sido colonizado por otra cuenca.
                            if (labels[nidx] === -1 && distances[nidx] > 0 && distances[nidx] < 999999) {
                                labels[nidx] = currentLabel;
                                const ndist = Math.min(d, Math.max(1, Math.round(distances[nidx])));
                                buckets[ndist].push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
        }

        return labels;
    }

    /**
     * Crea bordes (líneas de watershed) entre regiones
     */
    #createWatersheds(labels, width, height) {
        const result = new Uint8ClampedArray(width * height * 4);
        const palette = this.#generateColorPalette(256);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const label = labels[idx];

                if (label >= 0) {
                    const isBorder = this.#isBorderPixel(labels, x, y, width, height);

                    if (isBorder) {
                        result[idx * 4 + 0] = 255;
                        result[idx * 4 + 1] = 255;
                        result[idx * 4 + 2] = 255;
                        result[idx * 4 + 3] = 255;
                    } else {
                        const color = palette[label % palette.length];
                        result[idx * 4 + 0] = color.r;
                        result[idx * 4 + 1] = color.g;
                        result[idx * 4 + 2] = color.b;
                        result[idx * 4 + 3] = 255;
                    }
                } else {
                    result[idx * 4 + 0] = 0;
                    result[idx * 4 + 1] = 0;
                    result[idx * 4 + 2] = 0;
                    result[idx * 4 + 3] = 255;
                }
            }
        }

        return result;
    }

    #isBorderPixel(labels, x, y, width, height) {
        const currentLabel = labels[y * width + x];
        if (currentLabel < 0) return false;

        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dy, dx] of neighbors) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const neighborLabel = labels[ny * width + nx];
                if (neighborLabel !== currentLabel && neighborLabel >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

    #generateColorPalette(count) {
        const palette = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 137.5) % 360;
            const rgb = this.#hslToRgb(hue / 360, 0.8, 0.5); // Aumentada la saturación para nitidez
            palette.push(rgb);
        }
        return palette;
    }

    #hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    #binaryToRGBA(binary, width, height) {
        const rgba = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < binary.length; i++) {
            const val = binary[i];
            rgba[i * 4 + 0] = val;
            rgba[i * 4 + 1] = val;
            rgba[i * 4 + 2] = val;
            rgba[i * 4 + 3] = 255;
        }
        return rgba;
    }

    #distancesToRGBA(distances, width, height) {
        let maxDist = 0;
        for (let i = 0; i < distances.length; i++) {
            if (distances[i] > maxDist) maxDist = distances[i];
        }
        const rgba = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < distances.length; i++) {
            const normalized = (distances[i] / maxDist) * 255;
            rgba[i * 4 + 0] = normalized;
            rgba[i * 4 + 1] = normalized;
            rgba[i * 4 + 2] = normalized;
            rgba[i * 4 + 3] = 255;
        }
        return rgba;
    }

    #seedsToRGBA(seeds, width, height, distances) {
        let maxDist = 0;
        for (let i = 0; i < distances.length; i++) {
            if (distances[i] > maxDist) maxDist = distances[i];
        }
        const rgba = new Uint8ClampedArray(width * height * 4);

        for (let i = 0; i < distances.length; i++) {
            const normalized = (distances[i] / maxDist) * 100;
            rgba[i * 4 + 0] = normalized;
            rgba[i * 4 + 1] = normalized;
            rgba[i * 4 + 2] = normalized;
            rgba[i * 4 + 3] = 255;
        }

        seeds.forEach(seed => {
            const idx = seed.y * width + seed.x;
            rgba[idx * 4 + 0] = 255;
            rgba[idx * 4 + 1] = 0;
            rgba[idx * 4 + 2] = 0;
            rgba[idx * 4 + 3] = 255;
        });

        return rgba;
    }

    #labelsToRGBA(labels, width, height) {
        const palette = this.#generateColorPalette(256);
        const rgba = new Uint8ClampedArray(width * height * 4);

        for (let i = 0; i < labels.length; i++) {
            if (labels[i] >= 0) {
                const color = palette[labels[i] % palette.length];
                rgba[i * 4 + 0] = color.r;
                rgba[i * 4 + 1] = color.g;
                rgba[i * 4 + 2] = color.b;
                rgba[i * 4 + 3] = 255;
            } else {
                rgba[i * 4 + 0] = 0;
                rgba[i * 4 + 1] = 0;
                rgba[i * 4 + 2] = 0;
                rgba[i * 4 + 3] = 255;
            }
        }

        return rgba;
    }

    setStepsCallback(callback) {
        this.stepsCallback = callback;
    }
}