import React from "react";
import ReactDOM from "react-dom/client";
import MainRouter from "./MainRouter"; // ab App.js ki jagah MainRouter use ho raha hai

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
);
