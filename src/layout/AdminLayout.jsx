import { Layout, Menu, Drawer, Button } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  CommentOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const { Sider, Content } = Layout;

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/", icon: <AppstoreOutlined />, label: "Dashboard" },
    { key: "/admin/students", icon: <UserOutlined />, label: "Student" },
    { key: "/admin/exams", icon: <FileTextOutlined />, label: "Exam" },
    { key: "/admin/books", icon: <BookOutlined />, label: "Book" },
    { key: "/admin/orders", icon: <ClockCircleOutlined />, label: "Order" },
    { key: "/admin/entry-requests", icon: <CheckCircleOutlined />, label: "Request" },
    { key: "/admin/capitals", icon: <LineChartOutlined />, label: "Capital" },
    { key: "/admin/sms", icon: <CommentOutlined />, label: "SMS" },
  ];
  const SidebarMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key);
        setOpen(false);
      }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth="0"
        className="desktop-sidebar"
        style={{ background: "#fff" }}
      >
        <div style={logoStyle}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: 50,
              objectFit: "contain",
            }}
          />
        </div>
        {SidebarMenu}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <div style={logoStyle}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: 50,
              objectFit: "contain",
            }}
          />
        </div>
        {SidebarMenu}
      </Drawer>

      {/* Main Area */}
      <Layout>
        {/* Mobile Top Bar (ONLY mobile) */}
        <div className="mobile-topbar">
          <div className="mobile-logo">
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                height: 50,
                objectFit: "contain",
              }}
            />
          </div>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
          />
        </div>

        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

const logoStyle = {
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 18,
  borderBottom: "1px solid #f0f0f0",
};

const contentStyle = {
  background: "#f5f7fa",
  minHeight: "100vh",
};
