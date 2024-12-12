import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./assets/stylesheets/global.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./utils/ErrorBundling.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { get_settings } from "./services/fetch_settings.jsx";
import { DeckriptData } from "./utils/decriptShopSettings.jsx";
import useSpinner from "./components/common/spinner.jsx";

function RootApp() {
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await get_settings();
        const googleClientId = DeckriptData(
          settings?.google_client_id ||
            "4d5455324e7a6b344d5455344d546b304c57687a59326b34625734334e6e5a6c633268794f44673364446470636d63774d6a686a645452754e57316f4c6d467763484d755a3239765a32786c64584e6c636d4e76626e526c626e517559323974"
        );

        if (googleClientId) {
          setClientId(googleClientId);
        } else {
          throw new Error("Google Client ID tidak valid");
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={clientId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
