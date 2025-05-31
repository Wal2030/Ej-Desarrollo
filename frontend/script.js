const BASE_URL = "https://retoevaluacion.netlify.app/.netlify/functions/api";

function guardar(event) {
  event.preventDefault();

  const datos = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value
  };

  fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      listar();
    })
    .catch(err => console.error("Error:", err));
}

function listar() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(data => cargar(data))
    .catch(err => console.error("Error:", err));
}

function cargar(lista) {
  let salida = "";
  lista.forEach(elemento => {
    salida += `<b>Nombre de la empresa:</b> ${elemento.nombre}<br>`;
    salida += `<b>Email:</b> ${elemento.email}<br>`;
    salida += `<button onclick="rellenarFormulario('${elemento.id}', '${elemento.email}', '${elemento.nombre}')">Editar</button> `;
    salida += `<button onclick="eliminar('${elemento.id}')">Eliminar</button><br><br>`;
  });
  document.getElementById("rta").innerHTML = salida;
}

function rellenarFormulario(id, email, nombre) {
  document.getElementById("idActualizar").value = id;
  document.getElementById("emailActualizar").value = email;
  document.getElementById("nombreActualizar").value = nombre;
}

function eliminar(id) {
  if (!confirm("¿Seguro de eliminar esta empresa?")) return;

  fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      listar();
    })
    .catch(err => console.error("Error al eliminar:", err));
}

const actualizarDatos = async (e) => {
  e.preventDefault();
  const id = document.getElementById("idActualizar").value;
  const nombre = document.getElementById("nombreActualizar").value;
  const email = document.getElementById("emailActualizar").value;

  try {
    const respuesta = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email })
    });
    const datos = await respuesta.json();
    alert(datos.mensaje || "Actualizado");
    listar();
  } catch (error) {
    console.error("Error al actualizar:", error);
  }
};

// Funciones para manejar empresas
const API_URL = '/.netlify/functions/empresas';

async function obtenerEmpresas() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener empresas');
    const empresas = await response.json();
    mostrarEmpresas(empresas);
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al cargar las empresas', 'error');
  }
}

async function registrarEmpresa(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const empresa = {
    nombre: formData.get('nombre'),
    ruc: formData.get('ruc'),
    direccion: formData.get('direccion'),
    telefono: formData.get('telefono'),
    email: formData.get('email')
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresa)
    });

    if (!response.ok) throw new Error('Error al registrar empresa');
    
    const result = await response.json();
    mostrarMensaje('Empresa registrada exitosamente', 'success');
    event.target.reset();
    obtenerEmpresas();
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al registrar la empresa', 'error');
  }
}

async function eliminarEmpresa(id) {
  if (!confirm('¿Está seguro de eliminar esta empresa?')) return;

  try {
    const response = await fetch(`${API_URL}?id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar empresa');
    
    mostrarMensaje('Empresa eliminada exitosamente', 'success');
    obtenerEmpresas();
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al eliminar la empresa', 'error');
  }
}

function mostrarEmpresas(empresas) {
  const contenedor = document.getElementById('lista-empresas');
  if (!contenedor) return;

  contenedor.innerHTML = '';
  empresas.forEach(empresa => {
    const elemento = document.createElement('div');
    elemento.className = 'empresa-card';
    elemento.innerHTML = `
      <h3>${empresa.nombre}</h3>
      <p><strong>RUC:</strong> ${empresa.ruc}</p>
      <p><strong>Dirección:</strong> ${empresa.direccion}</p>
      <p><strong>Teléfono:</strong> ${empresa.telefono}</p>
      <p><strong>Email:</strong> ${empresa.email}</p>
      <button onclick="eliminarEmpresa('${empresa.id}')" class="btn-eliminar">Eliminar</button>
    `;
    contenedor.appendChild(elemento);
  });
}

function mostrarMensaje(mensaje, tipo) {
  const contenedor = document.getElementById('mensajes');
  if (!contenedor) return;

  const elemento = document.createElement('div');
  elemento.className = `mensaje ${tipo}`;
  elemento.textContent = mensaje;
  contenedor.appendChild(elemento);

  setTimeout(() => {
    elemento.remove();
  }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-empresa');
  if (form) {
    form.addEventListener('submit', registrarEmpresa);
  }
  obtenerEmpresas();
});
