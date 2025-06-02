// Configuración de Firebase
/* 
 * IMPORTANTE: Debes reemplazar estos valores con las credenciales reales de tu proyecto Firebase
 * Para obtener estas credenciales:
 * 1. Ve a https://console.firebase.google.com
 * 2. Selecciona tu proyecto "retoevaluacion"
 * 3. Ve a la configuración del proyecto (ícono de engranaje)
 * 4. En "Configuración general", encontrarás estos valores
 */
const firebaseConfig = {
    apiKey: "AIzaSyCeJARHI7JwRb_nqypXdb56wEOG5oKtp3Y",
    authDomain: "reto-mipymes.firebaseapp.com",
    projectId: "reto-mipymes",
    storageBucket: "reto-mipymes.appspot.com",
    messagingSenderId: "755553843367",
    appId: "1:755553843367:web:2ac35c5e52506f669bc382",
    measurementId: "G-15N6EZDK5N"
};

// Variable global para verificar si Firebase ya está inicializado
let firebaseInitialized = false;

// Función para inicializar Firebase
async function initializeFirebase() {
    if (firebaseInitialized) {
        return { success: true };
    }

    try {
        // Inicializar Firebase si no está inicializado
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Obtener referencias a los servicios
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Configurar Firestore
        db.settings({
            merge: true,
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });

        // Habilitar persistencia offline
        try {
            await db.enablePersistence({
                synchronizeTabs: true
            });
        } catch (err) {
            if (err.code == 'failed-precondition') {
                console.warn('La persistencia falló, múltiples pestañas abiertas');
            } else if (err.code == 'unimplemented') {
                console.warn('El navegador no soporta persistencia');
            }
        }

        // Verificar conexión con Firestore
        await db.enableNetwork();
        console.log('Firebase inicializado correctamente');
        console.log('Conexión con Firestore establecida');

        // Verificar Storage
        if (!storage) {
            throw new Error('Firebase Storage no está disponible');
        }

        // Exportar referencias globalmente
        window.db = db;
        window.auth = auth;
        window.storage = storage;

        // Marcar como inicializado
        firebaseInitialized = true;

        return { success: true };
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        mostrarErrorConfiguracion('Error al inicializar la aplicación: ' + error.message);
        return { success: false, error };
    }
}

// Función para mostrar errores de configuración
function mostrarErrorConfiguracion(mensaje) {
    console.error('Error de configuración:', mensaje);
    // Crear alerta si no existe
    let alertaError = document.getElementById('alertaErrorConfig');
    if (!alertaError) {
        alertaError = document.createElement('div');
        alertaError.id = 'alertaErrorConfig';
        alertaError.className = 'alert alert-danger fixed-top m-3';
        alertaError.style.zIndex = '9999';
        document.body.appendChild(alertaError);
    }

    // Mostrar mensaje
    alertaError.innerHTML = `
        <strong>Error de Configuración:</strong> ${mensaje}<br>
        <small>Por favor, contacta al administrador del sistema.</small>
    `;
}

// Inicializar Firebase inmediatamente
initializeFirebase().catch(error => {
    console.error('Error durante la inicialización:', error);
});

// También inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const initResult = await initializeFirebase();
        if (!initResult.success) {
            console.error('No se pudo inicializar Firebase:', initResult.error);
        }
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
}); 