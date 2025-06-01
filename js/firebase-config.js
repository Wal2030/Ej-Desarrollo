// Configuración de Firebase
const firebaseConfig = {
    apiKey: "REEMPLAZA_CON_TU_API_KEY",
    authDomain: "retoevaluacion.firebaseapp.com",
    projectId: "retoevaluacion",
    storageBucket: "retoevaluacion.appspot.com",
    messagingSenderId: "REEMPLAZA_CON_TU_MESSAGING_SENDER_ID",
    appId: "REEMPLAZA_CON_TU_APP_ID"
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