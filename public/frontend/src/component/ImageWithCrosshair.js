import React, { useRef, useEffect } from 'react';

const ImageWithCrosshair = ({ imageSrc, crosshairData }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = new Image();

        image.onload = () => {
            // Set canvas dimensions to match the original image
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw the image
            ctx.drawImage(image, 0, 0);

            // Calculate the scaled coordinates
            const scaledX = (crosshairData.x_coordinate / crosshairData.width) * image.width;
            const scaledY = (crosshairData.y_coordinate / crosshairData.height) * image.height;

            // Draw the crosshair
            drawCrosshair(ctx, scaledX, scaledY);
        };

        image.src = imageSrc;
    }, [imageSrc, crosshairData]);

    const drawCrosshair = (ctx, x, y) => {
        const size = 20; // Size of the crosshair
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y);
        ctx.lineTo(x + size / 2, y);
        ctx.stroke();

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x, y + size / 2);
        ctx.stroke();
    };

    return (
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
            <canvas ref={canvasRef} style={{ width: '100%' }} />
        </div>
    );
};

export default ImageWithCrosshair;