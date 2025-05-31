// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC1qPJxPkCcVUmQtXX5Yx4VBUVnuXVPDtE",
    authDomain: "mipymes-eval-2024.firebaseapp.com",
    projectId: "mipymes-eval-2024",
    storageBucket: "mipymes-eval-2024.appspot.com",
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
const storage = firebase.storage();

// Configuración de Firestore
db.settings({
    timestampsInSnapshots: true
});

// Exportar para uso en otros archivos
window.db = db;
window.auth = auth;
window.storage = storage; 