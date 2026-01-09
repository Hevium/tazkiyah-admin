import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "./app/router"
import AuthProvider from "./app/auth/AuthProvider"
import "antd/dist/reset.css"
import './index.css'
import { ConfigProvider } from "antd"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#237804", 
          colorLink: "#237804",
          colorLinkHover: "#2f9e44",
          colorLinkActive: "#1f7a1f",
        },
      }}
    >
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
)
