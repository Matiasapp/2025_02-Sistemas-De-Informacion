// context/authcontext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const refreshUser = async () => {
    // Retry logic: sometimes the session cookie isn't available immediately after login
    // Try fetching /auth/me up to 3 times with small delays before giving up.
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(`${backendUrl}/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          return;
        }

        // If we got a 401 and still have attempts left, wait and retry
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }

        // Last attempt failed: clear user
        setUser(null);
        return;
      } catch (err) {
        if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 250));
        else setUser(null);
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
