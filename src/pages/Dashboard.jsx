import { useContext, useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Spin, Typography, Button } from "antd";
import {
  UserOutlined,
  FileDoneOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
  LogoutOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { apiGet } from "../api/apiInstances";
import { AuthContext } from "../app/auth/AuthContext";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const {user, logout} = useContext(AuthContext)


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await apiGet.get("/api/admin/dashboard");
        setDashboardData(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const finalBalance =
    dashboardData.total_investment -
    dashboardData.total_expense +
    (dashboardData.total_revenue - dashboardData.total_loss);

  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ padding: 16, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          Assalamu Alaikum
        </Title>
        <Text type="secondary">
          {formattedDate} | {currentTime.toLocaleTimeString()}
        </Text>
      </div>

      {/* Row 1 */}
      <Row gutter={[16, 16]}>
        <Col md={4}>
          <Card>
            <Statistic
              title="Students"
              value={dashboardData.total_students}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Exams"
              value={dashboardData.total_published_exams}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Questions"
              value={dashboardData.total_questions}
              prefix={<QuestionCircleOutlined />}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Books"
              value={dashboardData.total_active_books}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Orders"
              value={dashboardData.total_orders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Investment"
              value={dashboardData.total_investment}
              prefix={<LineChartOutlined />}
              suffix="৳"
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col md={4}>
          <Card>
            <Statistic
              title="Expense"
              value={dashboardData.total_expense}
              prefix={<FallOutlined />}
              valueStyle={{ color: "#cf1322" }}
              suffix="৳"
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Revenue"
              value={dashboardData.total_revenue}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix="৳"
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Statistic
              title="Loss"
              value={dashboardData.total_loss}
              prefix={<FallOutlined />}
              valueStyle={{ color: "#cf1322" }}
              suffix="৳"
            />
          </Card>
        </Col>

        <Col md={4}>
          <Card
            style={{
              background: "linear-gradient(135deg, #d9f7be, #f6ffed)",
              border: "1px solid #b7eb8f",
            }}
          >
            <Statistic
              title="Final Balance"
              value={finalBalance}
              prefix={<WalletOutlined />}
              valueStyle={{
                color: "#237804",
                fontWeight: 700,
                fontSize: 22,
              }}
              suffix="৳"
            />
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f0f0f0",
          paddingTop: 16,
        }}
      >
        <Text type="secondary">
          Logged in as: <strong>{user?.email}</strong>
        </Text>

        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
