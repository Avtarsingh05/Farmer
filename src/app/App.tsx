import { LanguageProvider } from '@/i18n';
import { useEffect } from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppRouter } from './Router';
import { autoInitIfEmpty } from '@/services/firebaseInit';
import { MitraProvider } from '@/features/mitra/MitraProvider';
import { MitraButton } from '@/features/mitra/components/MitraButton';
import { MitraPanel } from '@/features/mitra/components/MitraPanel';

export function App() {
  useEffect(() => {
    void autoInitIfEmpty();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <NotificationProvider>
            <MitraProvider>
              <AppRouter />
              <MitraButton />
              <MitraPanel />
            </MitraProvider>
          </NotificationProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

