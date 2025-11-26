import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/AlertaToast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function RegisterForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    rut: "",
    phone: "",
  });
  const [rutError, setRutError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Formatea el RUT con puntos y guion
  const formatRUT = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();

    if (clean.length <= 1) return clean;

    let body = clean.slice(0, -1);
    let dv = clean.slice(-1);

    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${body}-${dv}`;
  };

  // Valida que el RUT tenga exactamente 9 caracteres (sin formato)
  const validateRUT = (rut: string): boolean => {
    const clean = rut.replace(/[^0-9kK]/g, "");
    return clean.length === 9;
  };
  const validatePhone = (phone: string): boolean => {
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length === 9;
  };

  // Capitaliza la primera letra de cada palabra
  const capitalizeFirstLetter = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "rut") {
      // Solo números y k/K, máximo 9 caracteres crudos
      const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
      if (clean.length <= 9) {
        setForm({ ...form, rut: clean });
        // Limpiar error mientras el usuario escribe
        if (rutError) setRutError("");
      }
    } else if (name === "firstname" || name === "lastname") {
      // Solo letras, acentos, ñ y espacios
      const clean = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
      const capitalized = capitalizeFirstLetter(clean);
      setForm({ ...form, [name]: capitalized });
    } else if (name === "phone") {
      // Solo números, máximo 9 caracteres
      const clean = value.replace(/[^0-9]/g, "");
      if (clean.length <= 9) {
        setForm({ ...form, phone: clean });
        if (phoneError) setPhoneError("");
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "rut") {
      const cleanRut = form.rut.replace(/[^0-9kK]/g, "");

      // Validar que tenga exactamente 9 caracteres antes de formatear
      if (cleanRut.length > 0 && cleanRut.length !== 9) {
        setRutError("El RUT debe tener exactamente 9 caracteres");
      } else {
        setRutError("");
        // Solo formatear si tiene 9 caracteres
        if (cleanRut.length === 9) {
          const formatted = formatRUT(form.rut);
          setForm({ ...form, rut: formatted });
        }
      }
    }
    if (e.target.name === "phone") {
      const cleanPhone = form.phone.replace(/[^0-9]/g, "");

      // Validar que tenga exactamente 9 caracteres antes de formatear
      if (cleanPhone.length > 0 && cleanPhone.length !== 9) {
        setPhoneError("El Teléfono debe tener exactamente 9 caracteres");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar RUT antes de enviar
    if (!validateRUT(form.rut)) {
      setRutError("El RUT debe tener exactamente 9 caracteres");
      return;
    }
    if (!validatePhone(form.phone)) {
      setPhoneError("El Teléfono debe tener exactamente 9 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const cleanRut = form.rut.replace(/[^0-9kK]/g, "").toUpperCase();
      const cleanPhone = form.phone.replace(/[^0-9]/g, "");

      const payload = {
        ...form,
        firstname: form.firstname.toLowerCase(),
        lastname: form.lastname.toLowerCase(),
        rut: cleanRut,
        phone: cleanPhone,
      };
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Error al registrar usuario", "error");
        return;
      }

      showToast(data.message || "Registro exitoso", "success");
      navigate("/login");
    } catch (err) {
      showToast("Error al registrar usuario", "error");
    } finally {
      setIsLoading(false);
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
        value={form.firstname}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <input
        type="text"
        name="lastname"
        placeholder="Apellido"
        value={form.lastname}
        onChange={handleChange}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <div className="mb-3">
        <input
          type="text"
          name="rut"
          placeholder="Rut (9 caracteres)"
          value={form.rut}
          onChange={handleChange}
          onBlur={handleBlur} // Formatea al perder foco
          className={`w-full border p-2 rounded ${
            rutError ? "border-red-500" : ""
          }`}
          required
        />
        {rutError && <p className="text-red-500 text-sm mt-1">{rutError}</p>}
      </div>
      <input
        type="email"
        name="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <div className="mb-3">
        <input
          type="text"
          name="phone"
          placeholder="Telefono (+56)"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full border p-2 rounded ${
            phoneError ? "border-red-500" : ""
          }`}
          required
        />
        {phoneError && (
          <p className="text-red-500 text-sm mt-1">{phoneError}</p>
        )}
      </div>
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white py-2 rounded font-semibold transition ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Registrando...
          </span>
        ) : (
          "Registrarse"
        )}
      </button>
      <div className="mt-4 text-center">
        <span className="text-gray-600">¿Ya tienes una cuenta? </span>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-700 hover:underline font-medium"
        >
          Inicia sesión
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
