// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ must import
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <NotificationProvider>
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  </NotificationProvider>
);