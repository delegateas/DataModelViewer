"use client"

import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";

export interface AuthState {
    isAuthenticated: boolean | null; // null = loading
    isLoading: boolean;
}

const initialState: AuthState = {
    isAuthenticated: null,
    isLoading: true
}

interface AuthContextType extends AuthState {
    checkAuth: () => Promise<void>;
    setAuthenticated: (authenticated: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, setState] = useState<AuthState>(initialState);

    const checkAuth = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const response = await fetch('/api/auth/session');
            const data = await response.json();
            setState({
                isAuthenticated: data.isAuthenticated,
                isLoading: false
            });
        } catch (error) {
            console.error('Auth check failed:', error);
            setState({
                isAuthenticated: false,
                isLoading: false
            });
        }
    }, []);

    const setAuthenticated = useCallback((authenticated: boolean) => {
        setState(prev => ({
            ...prev,
            isAuthenticated: authenticated,
            isLoading: false
        }));
    }, []);

    const logout = useCallback(() => {
        setState({
            isAuthenticated: false,
            isLoading: false
        });
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        ...state,
        checkAuth,
        setAuthenticated,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
