import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
<<<<<<< HEAD
import App from "./App.jsx";
import RecordSummary from "./pages/recordRead/RecordSummary.jsx";
=======
import MedicationPage from "./pages/MedicationPage.jsx";


>>>>>>> origin/jisoo0508


ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <MedicationPage />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
<<<<<<< HEAD
);
=======
  </React.StrictMode>
);
>>>>>>> origin/jisoo0508
