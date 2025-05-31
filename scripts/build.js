const fs = require('fs-extra');
const path = require('path');

async function build() {
    try {
        // Limpiar y crear el directorio dist
        await fs.emptyDir('dist');
        console.log('✓ Directorio dist limpiado');

        // Copiar archivos del frontend
        await fs.copy('frontend', 'dist');
        console.log('✓ Archivos del frontend copiados');

        // Asegurar que existe el directorio de funciones
        await fs.ensureDir('netlify/functions');
        console.log('✓ Directorio de funciones verificado');

        console.log('¡Construcción completada con éxito!');
    } catch (error) {
        console.error('Error durante la construcción:', error);
        process.exit(1);
    }
}

build(); 