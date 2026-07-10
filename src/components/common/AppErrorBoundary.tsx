import { Component, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

function clearSeriesJournalData() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('series-tracker:'))
    .forEach((key) => localStorage.removeItem(key));
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background px-4 py-8 text-text">
          <section className="mx-auto max-w-md rounded-2xl bg-card p-5 shadow-card">
            <h1 className="text-xl font-black">Series Journal</h1>
            <p className="mt-3 text-sm leading-6 text-text-soft">
              L’application a rencontré une donnée locale qu’elle ne peut pas afficher. Tu peux réparer le stockage local, puis l’app rechargera la sauvegarde publiée.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => location.reload()}
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white"
              >
                Recharger
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSeriesJournalData();
                  location.reload();
                }}
                className="rounded-full bg-lavender/70 px-4 py-2.5 text-sm font-bold text-text"
              >
                Réparer les données
              </button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
