import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PwaRegistration } from "./pwa/PwaRegistration";
import { I18nProvider } from "./i18n/I18nProvider";
import { AuthProvider } from "./providers/AuthProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <PwaRegistration />
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
