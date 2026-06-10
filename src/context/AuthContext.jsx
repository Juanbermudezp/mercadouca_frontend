import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TOKEN_KEY, REFRESH_KEY, USER_KEY } from '../constants';
import { authService } from '../services/auth/authService';
import { userService } from '../services/users/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  });
  const [loading, setLoading] = useState(false);
  // Mientras se sincroniza la sesión al arrancar no mostramos la app
  const [syncing, setSyncing] = useState(true);

  /** Guarda tokens + datos de usuario en localStorage y estado */
  const saveSession = (data) => {
    localStorage.setItem(TOKEN_KEY,   data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY,    JSON.stringify(data));
    setUser(data);
  };

  /**
   * Al montar, si existe una sesión guardada se llama a /auth/refresh.
   * Esto re-emite el accessToken con el rol ACTUAL de la BD.
   * Soluciona el problema donde el admin aprueba al vendedor pero el JWT
   * todavía dice BUYER hasta que el usuario vuelve a iniciar sesión.
   */
  useEffect(() => {
    const syncSession = async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_KEY);
      if (!storedRefreshToken) { setSyncing(false); return; }
      try {
        const res = await authService.refresh(storedRefreshToken);
        // Preservar sellerProfile si ya estaba en el user guardado
        const prevUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        const updated = { ...prevUser, ...res.data };
        localStorage.setItem(TOKEN_KEY,   updated.accessToken);
        localStorage.setItem(REFRESH_KEY, updated.refreshToken);
        localStorage.setItem(USER_KEY,    JSON.stringify(updated));
        setUser(updated);
        // Después de obtener el token fresco, cargar el perfil completo (incluye sellerProfile)
        await syncProfile(updated);
      } catch (err) {
        // Solo hacer logout si es un error de autenticación (401/403), NO si es error de red
        const status = err?.response?.status || err?.status;
        if (status === 401 || status === 403) {
          logout();
        }
        // Si es ERR_CONNECTION_REFUSED o red caída, conservar la sesión actual
      } finally {
        setSyncing(false);
      }
    };
    syncSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Polling adaptativo: refresca el JWT y el perfil periódicamente.
   * - Si hay una solicitud de vendedor PENDIENTE → cada 30 segundos (para detectar
   *   la aprobación del admin casi en tiempo real).
   * - En cualquier otro caso → cada 5 minutos (evita sobrecarga innecesaria).
   */
  useEffect(() => {
    if (!localStorage.getItem(REFRESH_KEY)) return;

    const poll = async () => {
      const rt = localStorage.getItem(REFRESH_KEY);
      if (!rt) return;
      try {
        const res = await authService.refresh(rt);
        const freshToken = res?.data?.accessToken || res?.accessToken;
        if (freshToken) {
          localStorage.setItem(TOKEN_KEY, freshToken);
          if (res?.data?.refreshToken || res?.refreshToken) {
            localStorage.setItem(REFRESH_KEY, res.data?.refreshToken || res.refreshToken);
          }
          // Actualizar el rol en el estado si cambió
          const currentRole = JSON.parse(localStorage.getItem(USER_KEY) || '{}')?.role;
          const newRole = res?.data?.role || res?.role;
          if (newRole && newRole !== currentRole) {
            await syncProfile();
          }
        }
      } catch { /* silencioso — si falla polling, no hacer nada */ }
    };

    // Determinar intervalo según estado actual
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const hasPendingRequest = storedUser?.sellerProfile?.status === 'PENDING';
    const INTERVAL = hasPendingRequest ? 30 * 1000 : 5 * 60 * 1000;

    const interval = setInterval(poll, INTERVAL);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sellerProfile?.status]); // Re-evaluar cuando cambia el estado de la solicitud

  /** Carga el perfil completo del usuario (incluye sellerProfile) y lo guarda */
  const syncProfile = async (currentUser) => {
    try {
      const res = await userService.getMe();
      const profileData = res.data;
      const base = currentUser || JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      const updated = { ...base, ...profileData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch { /* silencioso */ }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      saveSession(res.data);
      // Cargar perfil completo (incluye sellerProfile, firstName, lastName)
      // y retornar el usuario merged para que LoginPage tenga los datos correctos
      const fullProfile = await syncProfile(res.data);
      return fullProfile || res.data;
    } finally { setLoading(false); }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      saveSession(res.data);
      // Cargar perfil completo (firstName, lastName, accountNonLocked, etc.)
      const profile = await syncProfile(res.data);
      return profile || res.data;
    } finally { setLoading(false); }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  /**
   * Recarga perfil Y refresca el JWT.
   * Necesario cuando el rol cambia (ej: BUYER→SELLER tras aprobación).
   * El JWT antiguo diría BUYER, el nuevo dirá SELLER.
   */
  const refreshProfile = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_KEY);
      if (storedRefreshToken) {
        // Obtener JWT fresco con el rol actual de la BD
        const res = await authService.refresh(storedRefreshToken);
        localStorage.setItem(TOKEN_KEY,   res.accessToken || res.data?.accessToken || localStorage.getItem(TOKEN_KEY));
        if (res.refreshToken || res.data?.refreshToken) {
          localStorage.setItem(REFRESH_KEY, res.refreshToken || res.data?.refreshToken);
        }
      }
    } catch { /* silencioso — si falla el refresh, al menos actualizamos el perfil */ }
    return await syncProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers de rol ────────────────────────────────────────────────────────

  /** ¿Puede comprar? BUYER y SELLER pueden comprar */
  const canBuy = useCallback(() => {
    return !!user && (user.role === 'BUYER' || user.role === 'SELLER');
  }, [user]);

  /** ¿Puede vender? Solo SELLER verificado */
  const canSell = useCallback(() => {
    return !!user && user.role === 'SELLER';
  }, [user]);

  const isBuyer = useCallback(() => user?.role === 'BUYER', [user]);
  const isSeller = useCallback(() => user?.role === 'SELLER', [user]);
  const isAdmin   = useCallback(() => user?.role === 'ADMIN', [user]);
  const isBlocked = useCallback(() => user?.accountNonLocked === false, [user]);

  /**
   * ¿Puede solicitar ser vendedor?
   * Solo si es BUYER y NO tiene sellerProfile (o el perfil fue rechazado).
   */
  const canRequestSeller = useCallback(() => {
    if (!user || user.role !== 'BUYER') return false;
    const sp = user.sellerProfile;
    if (!sp) return true;
    // Permitir re-solicitar si fue rechazado
    return sp.status === 'REJECTED';
  }, [user]);

  /** ¿Tiene solicitud de vendedor pendiente? */
  const hasSellerRequestPending = useCallback(() => {
    return user?.sellerProfile?.status === 'PENDING';
  }, [user]);

  if (syncing) return null; // Esperar sincronización antes de renderizar la app

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, refreshProfile, syncProfile,
      canBuy, canSell, isBuyer, isSeller, isAdmin, isBlocked,
      canRequestSeller, hasSellerRequestPending,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
