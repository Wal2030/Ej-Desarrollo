// Funciones de utilidad global
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(valor);
}

// Funciones para manejo de errores
function mostrarError(mensaje) {
    alert(mensaje);
}

function manejarErrorRespuesta(response) {
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
}

// Funciones para manejo de confirmaciones
function confirmarEliminar(tipo, id) {
    return confirm(`¿Está seguro que desea eliminar este ${tipo}?`);
}

// Funciones para manejo de formularios
function limpiarFormulario(formId) {
    document.getElementById(formId).reset();
}

function deshabilitarFormulario(formId, deshabilitar = true) {
    const form = document.getElementById(formId);
    const elementos = form.elements;
    for (let i = 0; i < elementos.length; i++) {
        elementos[i].disabled = deshabilitar;
    }
}

// Funciones para manejo de API
async function fetchAPI(endpoint, opciones = {}) {
    try {
        const response = await fetch(window.API_URL + endpoint, {
            ...opciones,
            headers: {
                'Content-Type': 'application/json',
                ...opciones.headers
            }
        });
        return await manejarErrorRespuesta(response);
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        mostrarError('Ha ocurrido un error al procesar la solicitud');
        throw error;
    }
}

// Funciones para manejo de navegación
function navegarA(ruta) {
    window.history.pushState({}, '', ruta);
    loadContent(ruta);
}

// Funciones para manejo de elementos UI
function toggleElemento(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.style.display = elemento.style.display === 'none' ? 'block' : 'none';
    }
}

function actualizarElemento(elementId, contenido) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.innerHTML = contenido;
    }
}

// Funciones para validación
function validarFormulario(formId, validaciones) {
    const form = document.getElementById(formId);
    let esValido = true;
    
    validaciones.forEach(({ campo, validacion, mensaje }) => {
        const elemento = form.elements[campo];
        const valor = elemento.value;
        
        if (!validacion(valor)) {
            mostrarError(mensaje);
            elemento.focus();
            esValido = false;
        }
    });
    
    return esValido;
}

// Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
    // Configurar interceptores de navegación
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href').startsWith('/')) {
            e.preventDefault();
            navegarA(link.getAttribute('href'));
        }
    });

    // Manejar navegación del navegador
    window.addEventListener('popstate', () => {
        loadContent(window.location.pathname);
    });
});

// Inicialización de componentes Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}); 