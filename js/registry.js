/**
 * Registro de estrategias disponibles
 * Centraliza la configuración de todos los filtros/operaciones
 */
import { NegativeStrategy } from './strategies/NegativeStrategy.js';
import { LogStrategy } from './strategies/LogStrategy.js';
import { GammaStrategy } from './strategies/GammaStrategy.js';
import { NormalizeStrategy } from './strategies/NormalizeStrategy.js';
import { EqualizeStrategy } from './strategies/EqualizeStrategy.js';
import { GaussianBlurStrategy } from './strategies/GaussianBlurStrategy.js';
import { AverageFilterStrategy } from './strategies/AverageFilterStrategy.js';
import { MedianFilterStrategy } from './strategies/MedianFilterStrategy.js';

export const Registry = {
    "norm": {
        name: "Normalización de histograma",
        strategy: new NormalizeStrategy()
    },
    "equ": {
        name: "Ecualización de histograma",
        strategy: new EqualizeStrategy()
    },
    "neg": {
        name: "Imagen Negativa",
        strategy: new NegativeStrategy()
    },
    "log": {
        name: "Transf. Logarítmica",
        strategy: new LogStrategy()
    },
    "gamma": {
        name: "Transf. Gamma",
        strategy: new GammaStrategy()
    },
    "gauss": {
        name: "Filtro Gaussiano",
        strategy: new GaussianBlurStrategy()
    },
    "avg": {
        name: "Filtro de Media",
        strategy: new AverageFilterStrategy()
    },
    "median": {
        name: "Filtro Mediana",
        strategy: new MedianFilterStrategy()
    },
};
