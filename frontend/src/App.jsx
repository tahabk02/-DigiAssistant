import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";

// Common Components (eager loading)
import Layout from "./components/Common/Layout";
import Loader from "./components/Common/Loader";

// Lazy load route components
const WelcomeScreen = lazy(() =>
  import("./components/Assessment/WelcomeScreen")
);
const ConversationFlow = lazy(() =>
  import("./components/Assessment/ConversationFlow")
);
const Dashboard = lazy(() => import("./components/Results/Dashboard"));

// Services
import { apiService } from "./services/api";

// Styles
import "./styles/globals.css";

// ============= COMPONENTS =============

// Loading Fallback
function SuspenseLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}

// Initial Loading Screen
function InitialLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <Loader size="lg" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Initialisation
        </h2>
        <p className="text-gray-600">Préparation de votre expérience...</p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}

// Enhanced API Error Banner
function APIErrorBanner({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div
      className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200 shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              ⚠️ Connexion au serveur impossible
            </h3>
            <p className="text-sm text-red-700 mb-2">
              Le backend ne répond pas. Vérifiez qu'il est démarré correctement.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {import.meta.env.VITE_API_URL || "http://localhost:3000"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Réessayer
            </button>
            <button
              onClick={onDismiss}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Fermer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Connection Banner
function SuccessBanner({ onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 shadow-sm animate-slide-down"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="flex-1 text-sm font-medium text-green-800">
            ✅ Connexion au serveur rétablie avec succès
          </p>
          <button
            onClick={onDismiss}
            className="p-1 text-green-400 hover:text-green-600 rounded transition-colors"
            aria-label="Fermer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= CUSTOM HOOKS =============

function useAPIHealth() {
  const [state, setState] = useState({
    isReady: false,
    error: null,
    isChecking: true,
    showSuccess: false,
  });

  const checkHealth = async (isRetry = false) => {
    setState((prev) => ({ ...prev, isChecking: true }));

    try {
      await apiService.health();
      setState({
        isReady: true,
        error: null,
        isChecking: false,
        showSuccess: isRetry,
      });
    } catch (error) {
      console.error("API Health Check Failed:", error);
      setState({
        isReady: true,
        error: error.message || "Impossible de se connecter au serveur",
        isChecking: false,
        showSuccess: false,
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const retry = () => checkHealth(true);
  const dismissError = () => setState((prev) => ({ ...prev, error: null }));
  const dismissSuccess = () =>
    setState((prev) => ({ ...prev, showSuccess: false }));

  return { ...state, retry, dismissError, dismissSuccess };
}

// ============= MAIN APP =============

function App() {
  const {
    isReady,
    error,
    isChecking,
    showSuccess,
    retry,
    dismissError,
    dismissSuccess,
  } = useAPIHealth();

  // Initial loading screen
  if (!isReady || isChecking) {
    return <InitialLoader />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Success Banner */}
        {showSuccess && <SuccessBanner onDismiss={dismissSuccess} />}

        {/* Error Banner */}
        <APIErrorBanner
          error={error}
          onRetry={retry}
          onDismiss={dismissError}
        />

        <Layout>
          <Suspense fallback={<SuspenseLoader />}>
            <Routes>
              {/* Home - Welcome Screen */}
              <Route path="/" element={<WelcomeScreen />} />

              {/* Assessment Flow */}
              <Route
                path="/assessment/:assessmentId"
                element={<ConversationFlow />}
              />

              {/* Results Dashboard */}
              <Route path="/results/:assessmentId" element={<Dashboard />} />

              {/* 404 - Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
