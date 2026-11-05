import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { AntiGravityLoading } from "@/components/AntiGravityLoading";

export interface User {
  id: string;
  email: string;
  role: string;
  avatar?: string;
  name?: string;
  user_metadata?: {
    name?: string;
    avatar?: string;
    phone?: string;
    age?: number;
    gender?: string;
    biological_sex?: string;
    emergency_contact?: string;
    emergency_contact_name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ onboarding_completed: boolean; role: string; requires_emergency_contact?: boolean }>;
  signInWithGoogle: (
    credential: string,
    emergencyContact?: string,
    emergencyContactName?: string
  ) => Promise<{ onboarding_completed: boolean; role: string; requires_emergency_contact?: boolean }>;
  updateEmergencyContact: (contact: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/user")
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => {
          console.error("Session restore failed:", err);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const data = await api.post("/auth/register", { email, password, data: metadata });
    if (data.session?.access_token) {
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("userRole", data.user?.role || "user");
      setUser(data.user);
    }
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const data = await api.post("/auth/login", { email, password });
    
    if (data.session?.access_token) {
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("userRole", data.user?.role || "user");
      setUser(data.user);
    }
    return { 
      onboarding_completed: data.onboarding_completed, 
      role: data.user.role,
      requires_emergency_contact: data.requires_emergency_contact
    };
  };

  const signInWithGoogle = async (
    credential: string,
    emergencyContact?: string,
    emergencyContactName?: string
  ) => {
    const data = await api.post("/auth/google", { 
      credential,
      emergency_contact: emergencyContact,
      emergency_contact_name: emergencyContactName
    });
    
    if (data.session?.access_token) {
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("userRole", data.user?.role || "user");
      setUser(data.user);
    }
    return { 
      onboarding_completed: data.onboarding_completed, 
      role: data.user.role,
      requires_emergency_contact: data.requires_emergency_contact
    };
  };

  const updateEmergencyContact = async (contact: string, name?: string) => {
    const data = await api.post("/auth/emergency-contact", {
      emergency_contact: contact,
      emergency_contact_name: name
    });
    if (data.success && user) {
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          emergency_contact: contact,
          emergency_contact_name: name
        }
      });
    }
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("i18nextLng");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle, 
      updateEmergencyContact, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return <AntiGravityLoading label="Authenticating Telemetry..." />;
  }

  return user ? <>{children}</> : null;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    
    if (!adminToken) {
      navigate("/admin-login", { replace: true });
    } else {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <AntiGravityLoading label="Verifying Admin Privileges..." />;
  }

  return isAdmin ? <>{children}</> : null;
}
