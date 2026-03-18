import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, walletAPI, cartAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Проверка авторизации при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (!authAPI.isAuthenticated()) {
            setLoading(false);
            return;
        }

        try {
            const data = await authAPI.getMe();
            setUser(data.user);
            await loadBalance();
            await loadCartCount();
        } catch (error) {
            authAPI.removeToken();
            setUser(null);
            setBalance(0);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    const loadBalance = async () => {
        try {
            const data = await walletAPI.getBalance();
            setBalance(data.balance || 0);
        } catch (error) {
            console.error('Failed to load balance:', error);
        }
    };

    const loadCartCount = async () => {
        try {
            const data = await cartAPI.getCart();
            setCartCount(data.count || 0);
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    const register = async (name, email, password) => {
        const data = await authAPI.register(name, email, password);
        authAPI.setToken(data.token);
        setUser(data.user);
        return data;
    };

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        authAPI.setToken(data.token);
        setUser(data.user);
        await loadBalance();
        await loadCartCount();
        return data;
    };

    const logout = () => {
        authAPI.removeToken();
        setUser(null);
        setBalance(0);
        setCartCount(0);
    };

    const updateBalance = (newBalance) => {
        setBalance(newBalance);
    };

    const updateCartCount = (count) => {
        setCartCount(count);
    };

    const value = {
        user,
        balance,
        cartCount,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        register,
        login,
        logout,
        checkAuth,
        loadBalance,
        loadCartCount,
        updateBalance,
        updateCartCount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
}

export default AuthContext;
