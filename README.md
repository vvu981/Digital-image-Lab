# Laboratorio de Tratamiento Digital de Imágenes (TDI)

Sistema modular interactivo para aplicar filtros y transformaciones a imágenes en tiempo real. Todo el frontend está desacoplado mediante inyección de dependencias para facilitar pruebas y extensiones.

## ⚡ Ejecución rápida

```bash
npm install
npm run dev
```

El servidor se levanta en `http://localhost:5173` con recarga en caliente.

## � Instalación y Uso

### Opción 1: Con npm (Recomendado) ⭐

```bash
# 1. Instala dependencias
npm install

# 2. Inicia servidor de desarrollo (abre automáticamente)
npm run dev

# 3. Para producción - build optimizado
npm build

# 4. Preview del build
npm run preview
```

**Resultado:** Se abre en `http://localhost:5173` con hot reload automático

### Opción 2: Sin npm (Sin instalación)

**Live Server (VS Code):**
```bash
# 1. Instala extensión "Live Server" (Ritwick Dey)
# 2. Click derecho en index.html → "Open with Live Server"
```

**Python:**
```bash
python -m http.server 8000
# Abre: http://localhost:8000
```

**Node.js:**
```bash
npx http-server
# Abre: http://localhost:8080
```

### Opción 3: Con Docker 🐳

**Requisitos:** Docker y Docker Compose instalados

```bash
# 1. Construir e iniciar el contenedor
docker-compose up --build

# 2. Accede a http://localhost:5173
```

**Comandos útiles:**
```bash
# Detener el contenedor
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir la imagen
docker-compose build --no-cache

# Ejecutar en segundo plano
docker-compose up -d
```

**Ventajas:**
✅ Sin dependencias locales (solo Docker)  
✅ Entorno aislado y reproducible  
✅ Funciona igual en Windows, Mac, Linux  
✅ Ideal para despliegue en producción  

---

```
TDI/
├── index.html                 # Selector de módulos
├── style.css                  # Estilos (diseño neon)
├── README.md
│
├── image_ops/                 # Módulo de operaciones sobre una imagen
│   ├── index.html
│   └── main.js                # Bootstrapping con inyección de servicios/UI
├── ops_btw_images/            # Módulo de operaciones entre dos imágenes
│   ├── index.html
│   └── main.js
│
└── js/
    ├── BaseStrategy.js        # Clase abstracta (single input)
    ├── BinaryStrategy.js      # Clase base para estrategias binarias
    ├── engine.js              # LabEngine (single input)
    ├── registry.js            # Registro de estrategias single input
    ├── core/
    │   ├── BaseLabEngine.js   # Motor base con inyección de dependencias
    │   ├── HistogramService.js
    │   ├── ModalService.js
    │   └── StatusService.js   # Indicador de estado reutilizable
    ├── binary/
    │   ├── BinaryLabEngine.js
    │   ├── registry.js        # Estrategias binarias registradas
    │   └── strategies/
    │       └── *.js           # Estrategias para dos imágenes
    ├── strategies/            # Estrategias individuales single input
    │   └── *.js
    └── utils/
        └── imageUtils.js      # Utilidades compartidas (grayscale, etc.)

```

## 🏗️ Arquitectura

### Patrón Strategy con Clase Base Abstracta

Cada estrategia hereda de `BaseStrategy` (clase abstracta) que define el contrato:

```javascript
export class BaseStrategy {
    /**
     * Devuelve el valor máximo de intensidad (L - 1)
     * Para 8 bits: L = 256, devuelve 255
     * Parametrizable para diferentes formatos
     */
    getMaxIntensity() { return 255; }
    
    getDescription() { /* Descripción de la operación */ }
    getFormula() { /* Fórmula simple */ }
    getFormulaLatex() { /* Fórmula en LaTeX */ }
    getControls() { /* HTML de controles */ }
    attachControls(container) { /* Referencias a sliders/inputs */ }
    apply(data, w, h) { /* Implementación del filtro */ }
}
```

Cada filtro concreto **DEBE** implementar estos métodos. Si falta alguno, lanza un error en tiempo de ejecución. El hook `attachControls()` recibe el contenedor con los controles renderizados para evitar `document.getElementById`, facilitando pruebas unitarias.

Ejemplo:
```javascript
export class NegativeStrategy extends BaseStrategy {
    getDescription() { return "Invierte intensidades..."; }
    getFormula() { return "out(x,y) = L - 1 - in(x,y)"; }
    getFormulaLatex() { return "out(x,y) = L - 1 - in(x,y)"; }
    getControls() { return `<p>Inversión...</p>`; }
    apply(data, w, h) { 
        const L = this.getMaxIntensity(); // Parámetro (8-bit: 255)
        for (let i = 0; i < data.length; i += 4) {
            data[i] = L - data[i];     // Usa L en lugar de 255
        }
    }
}
```

### Ventajas de este diseño

✅ **Contrato explícito** - Invalida código incompleto  
✅ **Extensible** - Soporta 8-bit, 16-bit, 32-bit cambiando getMaxIntensity()  
✅ **Validación en tiempo de ejecución** - Detecta errores rápidamente  
✅ **Mejor documentación** - Cada método tiene propósito claro  
✅ **SOLID principles** - Open/Closed, Liskov Substitution  
✅ **Mantenibilidad** - Fácil verificar que todo cumple el estándar

### Componentes Principales

#### `BaseLabEngine` (js/core/BaseLabEngine.js)
- Inyecta dependencias (UI, servicios, estado) sin acoplarse a selectores concretos
- Orquesta `updateUI()` y notifica a cada estrategia cuando sus controles están listos (`attachControls`)
- Propaga el máximo de intensidad a todas las estrategias para mantener coherencia

#### `LabEngine` (js/engine.js) y `BinaryLabEngine` (js/binary/BinaryLabEngine.js)
- Extienden `BaseLabEngine` para escenarios de una o dos imágenes
- Dependen de servicios inyectados (histogramas, modal, estado) y solo manipulan los `canvas` recibidos
- Actualizan el `StatusService` para reflejar estados `idle`, `active` o `warn`

#### `Registry` (js/registry.js y js/binary/registry.js)
- Centralizan las estrategias disponibles y permiten registrar nuevas sin tocar los motores

#### Servicios Core
- `ModalService`: renderiza fórmulas/explicaciones en KaTeX
- `HistogramService`: dibuja histogramas de entrada/salida
- `StatusService`: abstrae el indicador visual y mensaje de estado para cualquier laboratorio

#### Estrategias Individuales (js/strategies/ y js/binary/strategies/)
- Cada una en su propio archivo, recibe sliders/inputs mediante `attachControls`
- Implementan únicamente la lógica de imagen; los servicios externos les suministran datos y parámetros

## ✨ Características

- **6 filtros/operaciones** (Negativo, Log, Gamma, Normalización, Ecualización, Gaussiano)
- **Fórmulas matemáticas** renderizadas con KaTeX
- **Histogramas** en tiempo real para ambas imágenes
- **Interfaz neon** modern y responsiva
- **Procesamiento en vivo** con sliders desacoplados del DOM global
- **Modal expandible** para ver fórmulas en grande
- **Indicador de estado reutilizable** (idle/active/warn) para guiar al usuario

## 🚀 Cómo Agregar un Nuevo Filtro

1. **Crear archivo en `js/strategies/`** (heredar de `BaseStrategy`):
```javascript
// js/strategies/MyNewFilter.js
import { BaseStrategy } from '../BaseStrategy.js';

export class MyNewFilterStrategy extends BaseStrategy {
    getDescription() { return "Descripción..."; }
    getFormula() { return "Fórmula simple..."; }
    getFormulaLatex() { return "Fórmula LaTeX..."; }
    getControls() { return "<p>Controles HTML...</p>"; }
    apply(data, w, h) {
        // Implementar lógica del filtro
        return outputPixels; // Uint8ClampedArray
    }
}
```

2. **Registrar en `js/registry.js`** (o en `js/binary/registry.js` si aplica a dos imágenes):
```javascript
import { MyNewFilterStrategy } from './strategies/MyNewFilter.js';

export const Registry = {
    // ... otros filtros ...
    "myfilter": {
        name: "Mi Nuevo Filtro",
        strategy: new MyNewFilterStrategy()
    }
};
```

✅ ¡El filtro aparecerá automáticamente en el selector!

**Nota:** Si no implementas el contrato completo (incluyendo `getControls`, `attachControls`, etc.), obtendrás un error descriptivo.

## 📝 Dependencias Externas

- **KaTeX** - Renderizado de fórmulas matemáticas (CDN)
- Ninguna otra dependencia (vanilla JavaScript)

## 🎓 Casos de Uso

- Enseñanza de procesamiento digital de imágenes
- Portfolio para demostraciones
- Base para proyectos de visión por computadora
- Análisis interactivo de transformaciones

**Autor:** Víctor Vallejo  