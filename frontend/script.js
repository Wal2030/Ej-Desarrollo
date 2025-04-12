function guardar(event) {
  event.preventDefault(); // Evita que el formulario recargue la página

  const datos = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    password_confirmation: document.getElementById("password_confirmation").value
  };

  console.log("Datos enviados: ", datos);

  fetch("https://retoevaluacion.netlify.app/.netlify/functions/Prueba", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  })
    .then(response => response.json())
    .then(data => {
      console.log("Respuesta del servidor:", data);
      alert(data.mensaje);
      listar();
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

function listar() {
  fetch("https://retoevaluacion.netlify.app/.netlify/functions/Prueba")
    .then(response => response.json())
    .then(data => cargar(data))
    .catch(error => console.error("Error:", error));
}

function cargar(lista) {
  let salida = "";
  lista.forEach((elemento, i) => {
    salida += `<b>${i + 1}:</b><br>`;
    salida += `<b>Nombre:</b> ${elemento.nombre}<br>`;
    salida += `<b>Email:</b> ${elemento.email}<br>`;
    salida += `<button onclick="rellenarFormulario('${elemento.email}', '${elemento.nombre}')">✏️ Editar</button> `;
    salida += `<button onclick="eliminar('${elemento.email}')">🗑️ Eliminar</button><br><br>`;
  });
  document.getElementById("rta").innerHTML = salida;
}

function rellenarFormulario(email, nombre) {
  document.getElementById("emailActualizar").value = email;
  document.getElementById("nombreActualizar").value = nombre;
}

function eliminar(email) {
  if (!confirm(`¿Estás seguro de eliminar el registro con email: ${email}?`)) {
    return;
  }

  fetch("https://retoevaluacion.netlify.app/.netlify/functions/Prueba/eliminar", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.mensaje || "Registro eliminado correctamente");
      listar(); // Recargar lista después de eliminar
    })
    .catch(error => {
      console.error("Error al eliminar:", error);
      alert("❌ Error al eliminar");
    });
}

const actualizarDatos = async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailActualizar").value;
  const nombre = document.getElementById("nombreActualizar").value;

  console.log("Email enviado:", email);

  try {
    const respuesta = await fetch("https://retoevaluacion.netlify.app/.netlify/functions/Prueba/actualizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, nombre }),
    });

    const datos = await respuesta.json();
    console.log("Respuesta del servidor:", datos);

    if (datos.mensaje === "No se encontró ninguna empresa con ese correo") {
      alert("⚠️ Ese correo no está registrado.");
    } else if (respuesta.ok) {
      alert("✅ Datos actualizados correctamente");
    } else {
      alert(datos.mensaje || "❌ Error al actualizar");
    }

  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Error de conexión");
  }
};



