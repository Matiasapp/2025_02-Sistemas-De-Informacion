import { useState } from "react";

function RegisterForm() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    rut: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      alert(data.message || "Registro exitoso");
    } catch (err) {
      console.error(err);
      alert("Error al registrar usuario");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>

      <input
        type="text"
        name="firstname"
        placeholder="Nombre"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <input
        type="text"
        name="lastname"
        placeholder="Apellido"
        onChange={handleChange}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="text"
        name="rut"
        placeholder="Rut"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Correo"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Telefono (+56)"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        onChange={handleChange}
        className="w-full border p-2 mb-4 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Registrarse
      </button>
    </form>
  );
}

export default RegisterForm;
