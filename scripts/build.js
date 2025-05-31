const fs = require('fs-extra');
const path = require('path');

async function buildFrontend() {
    try {
        // Asegurarse de que el directorio dist existe y está limpio
        await fs.emptyDir('dist');

        // Copiar todo el contenido de frontend a dist
        await fs.copy('frontend', 'dist');

        console.log('✅ Construcción del frontend completada con éxito');
    } catch (error) {
        console.error('❌ Error durante la construcción:', error);
        process.exit(1);
    }
}

buildFrontend(); 