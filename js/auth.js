// Referencias a elementos del DOM
function getElement(id) {
    return document.getElementById(id);
}

// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();
    
    const email = getElement('email').value;
    const password = getElement('password').value;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Mostrar mensaje de éxito
        mostrarAlerta('alertaExito', '¡Inicio de sesión exitoso! Redirigiendo...');
        
        // Obtener el rol del usuario
        const userDoc = await firebase.firestore().collection('users').doc(userCredential.user.uid).get();
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
        console.error('Error de inicio de sesión:', error);
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
    const passwordInput = getElement('password');
    if (passwordInput) {
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
}

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const alerta = getElement(tipo);
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove('d-none');
        setTimeout(() => {
            alerta.classList.add('d-none');
        }, 5000);
    }
}

// Verificar estado de autenticación
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
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
    
    const email = getElement('emailCliente').value;
    const password = getElement('passwordCliente').value;
    const nombre = getElement('nombreCliente').value;

    try {
        console.log('Iniciando registro...', { email, nombre });
        
        // Crear usuario en Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Usuario creado:', user.uid);

        // Guardar datos adicionales en Firestore
        const userData = {
            uid: user.uid,
            email: email,
            nombre: nombre,
            role: 'cliente',
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        console.log('Guardando datos en Firestore:', userData);
        
        await firebase.firestore().collection('users').doc(user.uid).set(userData);
        
        console.log('Datos guardados en Firestore');

        // Actualizar perfil
        await user.updateProfile({
            displayName: nombre
        });

        console.log('Perfil actualizado');
        mostrarAlerta('alertaExito', '¡Registro exitoso! Redirigiendo...');
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = '/dashboard-cliente.html';
        }, 1500);
    } catch (error) {
        console.error('Error detallado:', error);
        let mensajeError = 'Error al registrar. Por favor, intenta de nuevo.';
        
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    mensajeError = 'Ya existe una cuenta con este correo electrónico.';
                    break;
                case 'auth/invalid-email':
                    mensajeError = 'Correo electrónico inválido.';
                    break;
                case 'auth/operation-not-allowed':
                    mensajeError = 'El registro de usuarios está deshabilitado temporalmente.';
                    break;
                case 'auth/weak-password':
                    mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
                case 'auth/internal-error':
                    mensajeError = 'Error interno. Detalles: ' + error.message;
                    break;
                default:
                    mensajeError = `Error: ${error.message}`;
            }
        } else {
            mensajeError = `Error inesperado: ${error.message}`;
        }
        
        console.error('Mensaje de error:', mensajeError);
        mostrarAlerta('alertaError', mensajeError);
    }
}

// Función para registrar empresa
async function registrarEmpresa(event) {
    event.preventDefault();
    
    const email = getElement('emailEmpresa').value;
    const password = getElement('passwordEmpresa').value;
    const nombre = getElement('nombreEmpresa').value;
    const ruc = getElement('ruc').value;
    const direccion = getElement('direccion').value;
    const telefono = getElement('telefono').value;
    const rucDoc = getElement('rucDoc').files[0];
    const licenciaDoc = getElement('licenciaDoc').files[0];

    try {
        // Crear usuario en Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Subir documentos al Storage
        const rucUrl = await subirDocumento(rucDoc, `empresas/${user.uid}/ruc`);
        const licenciaUrl = await subirDocumento(licenciaDoc, `empresas/${user.uid}/licencia`);

        // Guardar datos en Firestore
        await firebase.firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            role: 'empresa',
            createdAt: new Date().toISOString(),
            status: 'pending'
        });

        await firebase.firestore().collection('empresas').doc(user.uid).set({
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

        mostrarAlerta('alertaExito', '¡Registro exitoso! Redirigiendo...');
        
        // Redirigir a página de espera de verificación
        setTimeout(() => {
            window.location.href = '/verificacion-pendiente.html';
        }, 1500);
    } catch (error) {
        console.error('Error de registro:', error);
        let mensajeError = 'Error al registrar. Por favor, intenta de nuevo.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                mensajeError = 'Ya existe una cuenta con este correo electrónico.';
                break;
            case 'auth/invalid-email':
                mensajeError = 'Correo electrónico inválido.';
                break;
            case 'auth/operation-not-allowed':
                mensajeError = 'El registro de usuarios está deshabilitado temporalmente.';
                break;
            case 'auth/weak-password':
                mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
                break;
        }
        
        mostrarAlerta('alertaError', mensajeError);
    }
}

// Función auxiliar para subir documentos
async function subirDocumento(file, path) {
    const storageRef = firebase.storage().ref(path);
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
    const passwordInput = getElement('passwordCliente');
    if (passwordInput) {
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
}

// Función para mostrar/ocultar contraseña en el registro de empresa
function togglePasswordEmpresa() {
    const passwordInput = getElement('passwordEmpresa');
    if (passwordInput) {
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
} 