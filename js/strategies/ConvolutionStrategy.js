/**
 * Clase base abstracta para estrategias que usan convolución
 * Proporciona métodos reutilizables para aplicar kernels a imágenes
 * 
 * @abstract
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class ConvolutionStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    /**
     * Aplica convolución 2D con un kernel dado
     * Utiliza reflexión de borde para manejar píxeles en los bordes
     * 
     * @param {Uint8ClampedArray} data - Datos de píxeles RGBA
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @param {number[]} kernel - Array del kernel (ya debe estar normalizado)
     * @param {number} kernelSize - Tamaño del kernel (kernel de 3x3, 5x5, etc)
     * @returns {Uint8ClampedArray} Datos procesados
     */
    applyConvolution(data, width, height, kernel, kernelSize) {
        const output = new Uint8ClampedArray(data.length);
        const half = Math.floor(kernelSize / 2);
        const L = this.getMaxIntensity();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                
                // Aplicar el kernel
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        // Coordenadas con reflexión de borde
                        const ny = this.reflectCoordinate(y + ky - half, height);
                        const nx = this.reflectCoordinate(x + kx - half, width);
                        
                        const pixelIndex = (ny * width + nx) * 4;
                        const kernelIndex = ky * kernelSize + kx;
                        
                        sum += data[pixelIndex] * kernel[kernelIndex];
                    }
                }

                const pixelIndex = (y * width + x) * 4;
                output[pixelIndex] = output[pixelIndex + 1] = output[pixelIndex + 2] = this.clamp(sum, 0, L);
                output[pixelIndex + 3] = 255;
            }
        }

        return output;
    }

    /**
     * Aplica filtro mediana con algoritmo optimizado (quickselect)
     * Mucho más rápido que ordenar completamente
     * 
     * @param {Uint8ClampedArray} data - Datos de píxeles RGBA
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @param {number} windowSize - Tamaño de la ventana (3, 5, 7, etc)
     * @returns {Uint8ClampedArray} Datos procesados
     */
    applyMedianFilter(data, width, height, windowSize) {
        const output = new Uint8ClampedArray(data.length);
        const half = Math.floor(windowSize / 2);
        const L = this.getMaxIntensity();
        const windowArea = windowSize * windowSize;
        const medianIndex = Math.floor(windowArea / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const values = [];

                // Recopilar valores en la ventana
                for (let wy = 0; wy < windowSize; wy++) {
                    for (let wx = 0; wx < windowSize; wx++) {
                        const ny = this.reflectCoordinate(y + wy - half, height);
                        const nx = this.reflectCoordinate(x + wx - half, width);
                        const pixelIndex = (ny * width + nx) * 4;
                        values.push(data[pixelIndex]);
                    }
                }

                // Obtener mediana usando quickselect (más rápido que sort)
                const median = this.quickSelect(values, 0, values.length - 1, medianIndex);

                const pixelIndex = (y * width + x) * 4;
                output[pixelIndex] = output[pixelIndex + 1] = output[pixelIndex + 2] = this.clamp(median, 0, L);
                output[pixelIndex + 3] = 255;
            }
        }

        return output;
    }

    /**
     * Algoritmo quickselect para encontrar el k-ésimo elemento más pequeño
     * O(n) en promedio vs O(n log n) de sort
     * 
     * @param {number[]} arr - Array de números
     * @param {number} left - Índice izquierdo
     * @param {number} right - Índice derecho
     * @param {number} k - Posición del elemento a encontrar
     * @returns {number} El k-ésimo elemento más pequeño
     */
    quickSelect(arr, left, right, k) {
        if (left === right) return arr[left];

        const pivotIndex = this.partition(arr, left, right);

        if (k === pivotIndex) {
            return arr[k];
        } else if (k < pivotIndex) {
            return this.quickSelect(arr, left, pivotIndex - 1, k);
        } else {
            return this.quickSelect(arr, pivotIndex + 1, right, k);
        }
    }

    /**
     * Particiona el array para quickselect
     * @private
     */
    partition(arr, left, right) {
        const pivot = arr[right];
        let i = left;

        for (let j = left; j < right; j++) {
            if (arr[j] < pivot) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
            }
        }
        [arr[i], arr[right]] = [arr[right], arr[i]];
        return i;
    }

    /**
     * Refleja una coordenada fuera de los límites (boundary handling)
     * @param {number} coord - Coordenada
     * @param {number} limit - Límite de la dimensión
     * @returns {number} Coordenada reflejada
     */
    reflectCoordinate(coord, limit) {
        if (coord < 0) {
            return -coord;
        }
        if (coord >= limit) {
            return 2 * limit - coord - 2;
        }
        return coord;
    }

    /**
     * Normaliza un kernel para que la suma sea 1
     * @param {number[]} kernel - Kernel a normalizar
     * @returns {number[]} Kernel normalizado
     */
    normalizeKernel(kernel) {
        const sum = kernel.reduce((a, b) => a + b, 0);
        if (sum === 0) return kernel;
        return kernel.map(value => value / sum);
    }

    /**
     * Crea un kernel de media (box filter)
     * Todos los valores son iguales para promediar píxeles vecinos
     * 
     * @param {number} size - Tamaño del kernel (3, 5, 7, etc)
     * @returns {number[]} Kernel normalizado de media
     */
    createAverageKernel(size) {
        const kernel = new Array(size * size).fill(1);
        return this.normalizeKernel(kernel);
    }

    /**
     * Crea un kernel paso bajo (low-pass filter)
     * Mayor peso en el centro, descendiendo hacia los bordes
     * 
     * @param {number} size - Tamaño del kernel (debe ser impar: 3, 5, 7, etc)
     * @returns {number[]} Kernel paso bajo normalizado
     */
    createLowPassKernel(size) {
        const kernel = new Array(size * size);
        const half = Math.floor(size / 2);
        let sum = 0;

        // Usar una función de distancia desde el centro
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dy = y - half;
                const dx = x - half;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Función exponencial inversa (mayor en centro, menor en bordes)
                const value = Math.exp(-distance);
                kernel[y * size + x] = value;
                sum += value;
            }
        }

        // Normalizar
        return kernel.map(v => v / sum);
    }
}
