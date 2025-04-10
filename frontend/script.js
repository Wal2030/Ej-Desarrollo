function guardar(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const password_confirmation = document.getElementById("password_confirmation").value;

  const data = {
    nombre,
    email,
    password,
    password_confirmation
  };

  fetch("/Prueba", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      listar(); // Refresca lista después de guardar
    })
    .catch((error) => console.error("Error:", error));
}

function cargar(resultado) {
  const lista = JSON.parse(resultado);
  let salida = "";
  lista.forEach((elemento, i) => {
    salida += `<b>${i + 1}. Nombre:</b> ${elemento.nombre}<br>`;
    salida += `<b>Email:</b> ${elemento.email}<br><br>`;
  });
  document.getElementById("rta").innerHTML = salida;
}

function listar() {
  fetch("/Prueba")
    .then((res) => res.json())
    .then((data) => cargar(JSON.stringify(data)))
    .catch((error) => console.error("Error:", error));
}
