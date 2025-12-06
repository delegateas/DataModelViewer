"use client"

import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";

export interface AuthState {
    isAuthenticated: boolean | null; // null = loading
    isLoading: boolean;
    authType?: 'password' | 'entraid';
    user?: {
        userPrincipalName?: string;
        name?: string;
    };
}

const initialState: AuthState = {
    isAuthenticated: null,
    isLoading: true,
    authType: undefined,
    user: undefined
}

interface AuthContextType extends AuthState {
    checkAuth: () => Promise<void>;
    setAuthenticated: (authenticated: boolean) => void;
    logout: () => Promise<void>;
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
                isLoading: false,
                authType: data.authType,
                user: data.user
            });
        } catch (error) {
            console.error('Auth check failed:', error);
            setState({
                isAuthenticated: false,
                isLoading: false,
                authType: undefined,
                user: undefined
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

    const logout = useCallback(async () => {
        try {
            // Call logout API to clear session
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            const data = await response.json();

            setState({
                isAuthenticated: false,
                isLoading: false,
                authType: undefined,
                user: undefined
            });

            // If EntraID, redirect to Easy Auth logout
            if (data.redirectToEntraIdLogout) {
                window.location.href = '/.auth/logout';
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
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
