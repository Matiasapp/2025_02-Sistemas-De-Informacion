import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeño delay para asegurar que el contexto esté cargado
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Verificando permisos...</p>
      </div>
    );
  }

  // Si no está autenticado o no es admin (type_ID !== 2), redirigir a 404
  if (!user || user.type_ID !== 2) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}
