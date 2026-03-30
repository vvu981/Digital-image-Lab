export function convertToGrayscale(imageData) {
    if (!imageData?.data) {
        throw new Error('convertToGrayscale requiere una instancia válida de ImageData');
    }

    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    return imageData;
}
