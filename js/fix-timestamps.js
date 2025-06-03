// Script temporal para arreglar timestamps
async function arreglarTimestamps() {
    try {
        const empresasRef = firebase.firestore().collection('empresas');
        const snapshot = await empresasRef.get();

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!data.createdAt) {
                await doc.ref.update({
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                console.log(`Timestamp agregado a empresa ${doc.id}`);
            }
        }
        console.log('Proceso completado');
    } catch (error) {
        console.error('Error:', error);
    }
} 