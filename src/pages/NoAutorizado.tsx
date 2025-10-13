import { useNavigate } from "react-router-dom";

export default function NoAutorizado() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">🚫 Acceso Denegado</h1>
      <p className="mb-6 text-lg text-gray-300">
        No tienes permisos para acceder a esta página.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Volver al Inicio
      </button>
    </div>
  );
}
