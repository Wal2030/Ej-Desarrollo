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
        
        // Si el documento no existe, créalo
        if (!userDoc.exists) {
            const userData = {
                uid: userCredential.user.uid,
                email: email,
                nombre: userCredential.user.displayName || email.split('@')[0],
                role: 'cliente', // Role por defecto
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);
            
            // Redirigir al dashboard de cliente
            setTimeout(() => {
                window.location.href = '/dashboard-cliente.html';
            }, 1500);
            return;
        }

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
    try {
        if (user) {
            // Esperar a que el token de ID se actualice
            await user.getIdToken(true);
            
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            
            // Si el documento no existe, créalo
            if (!userDoc.exists) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    nombre: user.displayName || user.email.split('@')[0],
                    role: 'cliente', // Role por defecto
                    createdAt: new Date().toISOString(),
                    status: 'active'
                };
                
                await firebase.firestore().collection('users').doc(user.uid).set(userData);
                
                // Si está en la página de login, redirigir al dashboard
                if (window.location.pathname === '/login.html') {
                    window.location.href = '/dashboard-cliente.html';
                }
                return;
            }

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
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
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

// Función auxiliar para subir documentos
async function subirDocumento(file, path) {
    try {
        console.log('Iniciando subida de documento:', path);
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(path);
        
        // Configurar los metadatos para evitar problemas CORS
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'Access-Control-Allow-Origin': '*'
            }
        };
        
        // Subir el archivo con los metadatos
        const snapshot = await fileRef.put(file, metadata);
        console.log('Documento subido exitosamente:', path);
        
        // Obtener la URL de descarga
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('URL del documento:', downloadURL);
        
        return downloadURL;
    } catch (error) {
        console.error('Error detallado al subir documento:', error);
        if (error.code === 'storage/unauthorized') {
            throw new Error('No tienes permisos para subir archivos. Por favor, inicia sesión nuevamente.');
        } else if (error.code === 'storage/canceled') {
            throw new Error('La subida fue cancelada. Por favor, intenta de nuevo.');
        } else if (error.code === 'storage/unknown') {
            throw new Error('Error desconocido al subir el archivo. Por favor, intenta de nuevo.');
        }
        throw new Error(`Error al subir ${path}: ${error.message}`);
    }
}

// Función para verificar si el email ya existe
async function verificarEmailExistente(email) {
    try {
        // Primero intentar con Authentication
        try {
            const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
            if (methods && methods.length > 0) {
                return { exists: true, role: 'unknown' };
            }
        } catch (authError) {
            console.warn('Error al verificar email en Auth:', authError);
        }

        // Luego verificar en Firestore
        const userQuery = await firebase.firestore().collection('users')
            .where('email', '==', email)
            .get();

        if (!userQuery.empty) {
            const userData = userQuery.docs[0].data();
            return {
                exists: true,
                role: userData.role || 'unknown'
            };
        }

        return { exists: false };
    } catch (error) {
        console.error('Error al verificar email:', error);
        // En caso de error de permisos, asumimos que no existe
        return { exists: false };
    }
}

// Función para registrar empresa
async function registrarEmpresa(event) {
    event.preventDefault();
    
    try {
        const email = getElement('emailEmpresa').value;
        const password = getElement('passwordEmpresa').value;
        const nombre = getElement('nombreEmpresa').value;
        const ruc = getElement('ruc').value;
        const direccion = getElement('direccion').value;
        const telefono = getElement('telefono').value;

        console.log('Iniciando registro de empresa:', { email, nombre, ruc });

        // Verificar si el email ya existe
        const emailCheck = await verificarEmailExistente(email);
        if (emailCheck.exists) {
            let mensajeError = 'Este correo electrónico ya está registrado';
            if (emailCheck.role) {
                mensajeError += ` como ${emailCheck.role}`;
            }
            throw new Error(mensajeError);
        }

        // Crear usuario en Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('Usuario creado:', user.uid);

        try {
            // Guardar datos en Firestore
            console.log('Guardando datos en Firestore...');
            const timestamp = new Date().toISOString();
            
            const userData = {
                uid: user.uid,
                email: email,
                role: 'empresa',
                createdAt: timestamp,
                status: 'pending',
                nombre: nombre
            };

            const empresaData = {
                uid: user.uid,
                nombre: nombre,
                ruc: ruc,
                direccion: direccion,
                telefono: telefono,
                email: email,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
                calificaciones: [],
                promedioCalificacion: 0,
                totalResenas: 0,
                documentosVerificacion: {
                    rucDoc: '',
                    licenciaFuncionamiento: ''
                }
            };

            // Guardar en ambas colecciones
            await firebase.firestore().collection('users').doc(user.uid).set(userData);
            await firebase.firestore().collection('empresas').doc(user.uid).set(empresaData);
            console.log('Datos guardados exitosamente');

            // Actualizar perfil
            await user.updateProfile({
                displayName: nombre
            });

            mostrarAlerta('alertaExito', '¡Registro exitoso! Redirigiendo al dashboard...');
            
            // Redirigir al dashboard de empresa
            setTimeout(() => {
                window.location.href = '/dashboard-empresa.html';
            }, 2000);
        } catch (error) {
            // Si hay un error después de crear el usuario, eliminarlo
            await user.delete();
            throw error;
        }
    } catch (error) {
        console.error('Error detallado del registro:', error);
        let mensajeError = 'Error al registrar. Por favor, intenta de nuevo.';
        
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    mensajeError = 'Este correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.';
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
                default:
                    mensajeError = error.message;
            }
        } else {
            mensajeError = error.message || 'Error desconocido al registrar empresa';
        }
        
        mostrarAlerta('alertaError', mensajeError);
    }
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