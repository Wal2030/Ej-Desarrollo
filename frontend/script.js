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
