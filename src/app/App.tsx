import { useEffect } from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppRouter } from './Router';
import { autoInitIfEmpty } from '@/services/firebaseInit';

export function App() {
  useEffect(() => {
    void autoInitIfEmpty();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppRouter />
          </NotificationProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

