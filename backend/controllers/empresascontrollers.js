// backend/controllers/empresascontrollers.js
let empresas = [];

const ingresar = (req, res) => {
    console.log("📩 Body recibido:", req.body);
    let body = req.body;

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return res.status(400).json({ mensaje: "Error al parsear el body", error: e.message });
        }
    }

    // ✅ Usa `body` en lugar de `req.body`
    const { nombre, email, password, password_confirmation } = body;

    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push("nombre");
    if (!email) camposFaltantes.push("email");
    if (!password) camposFaltantes.push("password");
    if (!password_confirmation) camposFaltantes.push("password_confirmation");

    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            mensaje: "Faltan datos",
            faltan: camposFaltantes,
            recibido: body, // también muestra el body correcto
        });
    }

    if (password !== password_confirmation) {
        return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
    }

    empresas.push({ nombre, email });
    console.log("✅ Empresa registrada:", { nombre, email });

    res.json({ mensaje: "Empresa registrada correctamente" });
};

const consultar = (req, res) => {
  res.json(empresas);
};

module.exports = { ingresar, consultar };