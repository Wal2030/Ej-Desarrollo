// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBjAcyxL-7ZuLV5saWtTzJt3g_hChn_Ync",
    authDomain: "mipymes-evaluacion.firebaseapp.com",
    projectId: "mipymes-evaluacion",
    storageBucket: "mipymes-evaluacion.appspot.com",
    messagingSenderId: "654910430175",
    appId: "1:654910430175:web:9c287dc8536e17e0e6f3b4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Exportar para uso en otros archivos
window.db = db;
window.auth = auth;
window.storage = storage; 