import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (phone: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  displayPhone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 手机号转邮箱格式（底层用 Email 认证，不需要短信验证）
function phoneToEmail(phone: string): string {
  return phone.replace(/[^0-9]/g, "") + "@phone.example.com";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayPhone, setDisplayPhone] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setDisplayPhone(session?.user?.user_metadata?.phone || "");
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setDisplayPhone(session?.user?.user_metadata?.phone || "");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const API_BASE = import.meta.env.VITE_API_URL || '';
  const signUp = async (phone: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.error) return { error: new Error(data.error) as unknown as AuthError };
      return { error: null };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const signIn = async (phone: string, password: string): Promise<{ error: AuthError | null }> => {
    const email = phoneToEmail(phone);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut, displayPhone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
