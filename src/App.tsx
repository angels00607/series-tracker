import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { LibraryProvider } from './context/LibraryContext';
import { AppRouter } from './router/AppRouter';

function restoreRedirect() {
  try {
    const redirect = sessionStorage.getItem('redirect');
    if (!redirect) return;
    sessionStorage.removeItem('redirect');
    const url = new URL(redirect);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Some mobile browsers can block sessionStorage. The app can still start normally.
  }
}

restoreRedirect();

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppErrorBoundary>
        <LibraryProvider>
          <AppRouter />
        </LibraryProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
