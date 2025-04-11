async function guardar(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const password_confirmation = document.getElementById("password_confirmation").value;

  const datos = { nombre, email, password, password_confirmation };
  console.log("Datos enviados: ", datos);

  const response = await fetch("/.netlify/functions/Prueba", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  const resultado = await response.json();
  console.log("Respuesta del servidor:", resultado);

  alert(resultado.mensaje);
}
