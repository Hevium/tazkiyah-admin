import { Button, Card, Form, Input, message } from "antd"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase/config"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()

  const onFinish = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      message.success("Login successful")
      navigate("/")
    } catch (err) {
      message.error("Invalid email or password", err)
    }
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f0f2f5"
    }}>
      <Card title="Admin Login" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter Email"/>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  )
}
