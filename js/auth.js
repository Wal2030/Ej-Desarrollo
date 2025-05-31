// Referencias a elementos del DOM
const loginForm = document.getElementById('loginForm');
const alertaError = document.getElementById('alertaError');
const alertaExito = document.getElementById('alertaExito');

// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Mostrar mensaje de éxito
        mostrarAlerta('alertaExito', '¡Inicio de sesión exitoso! Redirigiendo...');
        
        // Obtener el rol del usuario
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        const userData = userDoc.data();

        // Redirigir según el rol
        setTimeout(() => {
            if (userData.role === 'empresa') {
                window.location.href = '/dashboard-empresa.html';
            } else if (userData.role === 'cliente') {
                window.location.href = '/dashboard-cliente.html';
            } else if (userData.role === 'admin') {
                window.location.href = '/dashboard-admin.html';
            } else {
                window.location.href = '/';
            }
        }, 1500);

    } catch (error) {
        let mensajeError = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                mensajeError = 'No existe una cuenta con este correo electrónico.';
                break;
            case 'auth/wrong-password':
                mensajeError = 'Contraseña incorrecta.';
                break;
            case 'auth/invalid-email':
                mensajeError = 'Correo electrónico inválido.';
                break;
            case 'auth/user-disabled':
                mensajeError = 'Esta cuenta ha sido deshabilitada.';
                break;
        }
        
        mostrarAlerta('alertaError', mensajeError);
    }
}

// Función para iniciar sesión con Google
async function iniciarSesionGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        // Verificar si el usuario ya existe en la base de datos
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        
        if (!userDoc.exists) {
            // Si es un nuevo usuario, redirigir a la página de selección de rol
            window.location.href = '/seleccionar-rol.html';
        } else {
            // Si ya existe, redirigir según su rol
            const userData = userDoc.data();
            if (userData.role === 'empresa') {
                window.location.href = '/dashboard-empresa.html';
            } else if (userData.role === 'cliente') {
                window.location.href = '/dashboard-cliente.html';
            } else if (userData.role === 'admin') {
                window.location.href = '/dashboard-admin.html';
            }
        }
    } catch (error) {
        mostrarAlerta('alertaError', 'Error al iniciar sesión con Google.');
        console.error('Error:', error);
    }
}

// Función para mostrar/ocultar contraseña
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById(tipo);
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
    
    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
        alerta.classList.add('d-none');
    }, 5000);
}

// Verificar estado de autenticación
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Redirigir si ya está autenticado y está en la página de login
            if (window.location.pathname === '/login.html') {
                if (userData.role === 'empresa') {
                    window.location.href = '/dashboard-empresa.html';
                } else if (userData.role === 'cliente') {
                    window.location.href = '/dashboard-cliente.html';
                } else if (userData.role === 'admin') {
                    window.location.href = '/dashboard-admin.html';
                }
            }
        }
    }
});

// Función para registrar cliente
async function registrarCliente(event) {
    event.preventDefault();
    const email = document.getElementById('emailCliente').value;
    const password = document.getElementById('passwordCliente').value;
    const nombre = document.getElementById('nombreCliente').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Guardar datos adicionales en Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            nombre: nombre,
            role: 'cliente',
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        // Actualizar perfil
        await user.updateProfile({
            displayName: nombre
        });

        // Redirigir al dashboard
        window.location.href = '/dashboard-cliente.html';
    } catch (error) {
        errorMessage.textContent = 'Error al registrar: ' + error.message;
        errorMessage.classList.remove('d-none');
    }
}

// Función para registrar empresa
async function registrarEmpresa(event) {
    event.preventDefault();
    const email = document.getElementById('emailEmpresa').value;
    const password = document.getElementById('passwordEmpresa').value;
    const nombre = document.getElementById('nombreEmpresa').value;
    const ruc = document.getElementById('ruc').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const rucDoc = document.getElementById('rucDoc').files[0];
    const licenciaDoc = document.getElementById('licenciaDoc').files[0];
    const errorMessage = document.getElementById('errorMessage');

    try {
        // Crear usuario en Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Subir documentos al Storage
        const rucUrl = await subirDocumento(rucDoc, `empresas/${user.uid}/ruc`);
        const licenciaUrl = await subirDocumento(licenciaDoc, `empresas/${user.uid}/licencia`);

        // Guardar datos en Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            role: 'empresa',
            createdAt: new Date().toISOString(),
            status: 'pending'
        });

        await db.collection('empresas').doc(user.uid).set({
            uid: user.uid,
            nombre: nombre,
            ruc: ruc,
            direccion: direccion,
            telefono: telefono,
            email: email,
            status: 'pending',
            documentosVerificacion: {
                rucDoc: rucUrl,
                licenciaFuncionamiento: licenciaUrl
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Actualizar perfil
        await user.updateProfile({
            displayName: nombre
        });

        // Redirigir a página de espera de verificación
        window.location.href = '/verificacion-pendiente.html';
    } catch (error) {
        errorMessage.textContent = 'Error al registrar: ' + error.message;
        errorMessage.classList.remove('d-none');
    }
}

// Función auxiliar para subir documentos
async function subirDocumento(file, path) {
    const storageRef = storage.ref(path);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
}

// Función para cerrar sesión
function cerrarSesion() {
    auth.signOut().then(() => {
        localStorage.removeItem('userRole');
        window.location.href = '/';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
}

// Función para mostrar/ocultar contraseña en el registro de cliente
function togglePasswordCliente() {
    const passwordInput = document.getElementById('passwordCliente');
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Función para mostrar/ocultar contraseña en el registro de empresa
function togglePasswordEmpresa() {
    const passwordInput = document.getElementById('passwordEmpresa');
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
} 