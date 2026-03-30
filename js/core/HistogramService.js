export class HistogramService {
    draw(canvas, data, color) {
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 400;
        canvas.height = 100;

        const histogram = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) {
            histogram[data[i]] += 1;
        }

        const max = Math.max(...histogram) || 1;
        ctx.clearRect(0, 0, 400, 100);
        ctx.fillStyle = color;
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogram[i] / max) * 100;
            ctx.fillRect(i * (400 / 256), 100 - barHeight, 400 / 256, barHeight);
        }
    }
}
