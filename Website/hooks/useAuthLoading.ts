import { useState } from 'react';

interface UseAuthLoadingReturn {
  isAuthenticating: boolean;
  isRedirecting: boolean;
  startAuthentication: () => void;
  startRedirection: () => void;
  stopAuthentication: () => void;
  stopRedirection: () => void;
  resetAuthState: () => void;
}

export const useAuthLoading = (): UseAuthLoadingReturn => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const startAuthentication = () => {
    setIsAuthenticating(true);
  };

  const startRedirection = () => {
    setIsRedirecting(true);
  };

  const stopAuthentication = () => {
    setIsAuthenticating(false);
  };

  const stopRedirection = () => {
    setIsRedirecting(false);
  };

  const resetAuthState = () => {
    setIsAuthenticating(false);
    setIsRedirecting(false);
  };

  return {
    isAuthenticating,
    isRedirecting,
    startAuthentication,
    startRedirection,
    stopAuthentication,
    stopRedirection,
    resetAuthState,
  };
};
