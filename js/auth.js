// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Obtener datos adicionales del usuario
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        // Guardar rol en localStorage
        localStorage.setItem('userRole', userData.role);
        
        // Redirigir según el rol
        if (userData.role === 'empresa') {
            window.location.href = '/dashboard-empresa.html';
        } else if (userData.role === 'cliente') {
            window.location.href = '/dashboard-cliente.html';
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        errorMessage.textContent = 'Error al iniciar sesión: ' + error.message;
        errorMessage.classList.remove('d-none');
    }
}

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

// Observador del estado de autenticación
auth.onAuthStateChanged(async (user) => {
    const loginNav = document.getElementById('btnLoginNav');
    const registroNav = document.getElementById('btnRegistroNav');
    const perfilNav = document.getElementById('btnPerfil');
    const cerrarSesionNav = document.getElementById('btnCerrarSesion');

    if (user) {
        // Usuario autenticado
        loginNav?.classList.add('d-none');
        registroNav?.classList.add('d-none');
        perfilNav?.classList.remove('d-none');
        cerrarSesionNav?.classList.remove('d-none');

        // Obtener rol del usuario
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            localStorage.setItem('userRole', userData.role);
        }
    } else {
        // Usuario no autenticado
        loginNav?.classList.remove('d-none');
        registroNav?.classList.remove('d-none');
        perfilNav?.classList.add('d-none');
        cerrarSesionNav?.classList.add('d-none');
        localStorage.removeItem('userRole');
    }
}); 