// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpkGlvuGqJqXGhkn2QZd6Yd6HNJ5pqVuM",
    authDomain: "retoevaluacion.firebaseapp.com",
    projectId: "retoevaluacion",
    storageBucket: "retoevaluacion.appspot.com",
    messagingSenderId: "1098360338259",
    appId: "1:1098360338259:web:9a8b3d5c8b8b8b8b8b8b8b"
};

// Verificar que la configuración sea válida
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
    console.error("Error: API Key no válida o no definida");
    alert("Error de configuración: Por favor, contacta al administrador");
}

// Inicializar Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase inicializado correctamente");
    } else {
        console.log("Firebase ya estaba inicializado");
    }
} catch (error) {
    console.error("Error al inicializar Firebase:", error);
    alert("Error al inicializar la aplicación: Por favor, contacta al administrador");
}

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Configuración de Firestore
db.settings({
    merge: true
});

// Verificar conexión con Firestore
db.enableNetwork().then(() => {
    console.log("Conexión con Firestore establecida");
}).catch(error => {
    console.error("Error al conectar con Firestore:", error);
});

// Verificar estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
    } else {
        console.log("Usuario no autenticado");
    }
});

// Exportar para uso en otros archivos
window.db = db;
window.auth = auth; 