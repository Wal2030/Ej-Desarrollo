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
    storageBucket: "reto-mipymes.firebasestorage.app",
    messagingSenderId: "755553843367",
    appId: "1:755553843367:web:2ac35c5e52506f669bc382",
    measurementId: "G-15N6EZDK5N"
  };

// Función para inicializar Firebase
function initializeFirebase() {
    try {
        // Verificar si ya está inicializado
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase inicializado correctamente');
        }

        // Obtener referencias
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Configurar Firestore
        db.settings({
            merge: true
        });

        // Verificar conexión con Firestore
        db.enableNetwork()
            .then(() => console.log('Conexión con Firestore establecida'))
            .catch(error => {
                console.error('Error al conectar con Firestore:', error);
                mostrarErrorConfiguracion('Error al conectar con la base de datos');
            });

        // Verificar autenticación
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log('Usuario autenticado:', user.email);
            } else {
                console.log('No hay usuario autenticado');
            }
        });

        // Exportar referencias
        window.auth = auth;
        window.db = db;
        window.storage = storage;

        return { success: true };
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        mostrarErrorConfiguracion('Error al inicializar la aplicación');
        return { success: false, error };
    }
}

// Función para mostrar errores de configuración
function mostrarErrorConfiguracion(mensaje) {
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

// Inicializar Firebase
const initResult = initializeFirebase();
if (!initResult.success) {
    console.error('No se pudo inicializar Firebase:', initResult.error);
} 