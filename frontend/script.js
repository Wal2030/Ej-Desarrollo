function guardar(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const password_confirmation = document.getElementById("password_confirmation").value;

  const data = { nombre, email, password, password_confirmation };

  fetch("/.netlify/functions/Prueba", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.mensaje);
      listar();
    })
    .catch((error) => console.error("Error:", error));
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

// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", listar);
