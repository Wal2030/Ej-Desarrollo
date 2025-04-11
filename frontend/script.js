function guardar(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const password_confirmation = document.getElementById("password_confirmation").value;

  const data = { nombre, email, password, password_confirmation };

  fetch("http://localhost:3000/estudiantes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Registro exitoso");
      listar(); // Cargar la lista actualizada
    })
    .catch((error) => console.error("Error:", error));
}

function listar() {
  fetch("http://localhost:3000/estudiantes") // Asegúrate de que esta ruta existe en tu backend
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
