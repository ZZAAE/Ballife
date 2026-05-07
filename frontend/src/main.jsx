import React from "react";
import ReactDOM from "react-dom/client"; //HTML.DOM에 연결
import { BrowserRouter } from "react-router-dom"; //페이지라우팅 (페이지와 페이지간의 이동)
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right" //화면 우측 상단
          toastOptions={{
            duration: 3000, //3초후 자동으로 사라짐
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
);
