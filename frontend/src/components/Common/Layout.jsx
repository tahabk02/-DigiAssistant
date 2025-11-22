import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  DigiAssistant
                </h1>
                <p className="text-xs text-gray-500">Diagnostic Digital</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Accueil
              </Link>
              <a
                href="#apropos"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                À propos
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">DigiAssistant</h3>
              <p className="text-gray-400 text-sm">
                Évaluez la maturité digitale de votre entreprise avec notre
                diagnostic conversationnel et adaptatif.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <a
                    href="#apropos"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: contact@digitancy.com</li>
                <li>Tél: +212 XXX XXX XXX</li>
                <li>Casablanca, Maroc</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} DigiAssistant by Digitancy. Tous
              droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
