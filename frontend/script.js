function guardar(event) {
  event.preventDefault(); // 🚫 Esto evita que el formulario recargue la página

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
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

function listar() {
  fetch("/.netlify/functions/Prueba")
    .then((res) => res.json())
    .then((data) => cargar(data))
    .catch((error) => console.error("Error:", error));
}

function cargar(lista) {
  let salida = "";
  lista.forEach((elemento, i) => {
    salida += `<b>${i + 1}:</b><br>`;
    salida += `<b>Nombre:</b> ${elemento.nombre}<br>`;
    salida += `<b>Email:</b> ${elemento.email}<br><br>`;
  });
  document.getElementById("rta").innerHTML = salida;
}
