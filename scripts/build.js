const fs = require('fs-extra');
const path = require('path');

async function buildFrontend() {
    try {
        // Limpiar el directorio dist si existe
        await fs.emptyDir('dist');

        // Copiar archivos del frontend
        await fs.copy('frontend', 'dist');

        console.log('Frontend construido exitosamente');
    } catch (error) {
        console.error('Error al construir el frontend:', error);
        process.exit(1);
    }
}

buildFrontend(); 