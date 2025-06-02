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

// Singleton para Firebase
let app;
let auth;
let db;
let storage;

// Inicializar Firebase solo si no está inicializado
if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.apps[0];
}

// Obtener instancias de los servicios
auth = firebase.auth();
db = firebase.firestore();
storage = firebase.storage();

// Configurar Firestore inmediatamente después de obtener la instancia
db.settings({
    merge: true,
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Intentar habilitar persistencia
db.enablePersistence({
    synchronizeTabs: true
}).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('La persistencia falló, múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
        console.warn('El navegador no soporta persistencia');
    }
});

// Exportar las instancias globalmente
window.app = app;
window.auth = auth;
window.db = db;
window.storage = storage;

// Exportar las instancias para módulos ES6
export { app, auth, db, storage };

console.log('Firebase inicializado correctamente');

// Función para mostrar errores de configuración
function mostrarErrorConfiguracion(mensaje) {
    console.error('Error de configuración:', mensaje);
    let alertaError = document.getElementById('alertaErrorConfig');
    if (!alertaError) {
        alertaError = document.createElement('div');
        alertaError.id = 'alertaErrorConfig';
        alertaError.className = 'alert alert-danger fixed-top m-3';
        alertaError.style.zIndex = '9999';
        document.body.appendChild(alertaError);
    }
    alertaError.innerHTML = `
        <strong>Error de Configuración:</strong> ${mensaje}<br>
        <small>Por favor, contacta al administrador del sistema.</small>
    `;
} 