// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpkGlvuGqJqXGhkn2QZd6Yd6HNJ5pqVuM",
    authDomain: "retoevaluacion.firebaseapp.com",
    projectId: "retoevaluacion",
    storageBucket: "retoevaluacion.appspot.com",
    messagingSenderId: "1098360338259",
    appId: "1:1098360338259:web:9a8b3d5c8b8b8b8b8b8b8b"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Configuración de Firestore
db.settings({
    merge: true // Esto evitará el warning de override
});

// Exportar para uso en otros archivos
window.db = db;
window.auth = auth; 