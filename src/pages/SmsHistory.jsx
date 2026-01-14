import { useContext, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message as antdMessage,
  message,
  Typography,
} from "antd";
import { apiGet, apiPost } from "../api/apiInstances";
import { AuthContext } from "../app/auth/AuthContext";
import { SendOutlined } from "@ant-design/icons";

const { Title } = Typography;

const SmsHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user } = useContext(AuthContext);

  const [searchNumber, setSearchNumber] = useState("");
  const [sendFrom, setSendFrom] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // ================= FETCH SMS =================
  const fetchSms = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const res = await apiGet.get("/api/sms/all", {
        params: {
          page,
          limit,
          number: searchNumber,
          send_from: sendFrom,
        },
      });

      setData(res.data.data);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.pagination.total,
      });
    } catch {
      antdMessage.error("Failed to load SMS history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSms();
  }, []);

  // ================= TABLE PAGINATION =================
  const handleTableChange = (pagination) => {
    fetchSms(pagination.current, pagination.pageSize);
  };

  // ================= SEND SMS =================
  const handleSendSms = async () => {
    try {
      if (!user?.email) {
        return message.error("Please Login First");
      }

      const payload = await form.validateFields();
      payload.send_from = user.email;

      await apiPost.post("/api/sms/send-new", payload);

      antdMessage.success("SMS sent successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchSms(1, pagination.pageSize);
    } catch (error) {
      antdMessage.error(error?.response?.data?.message || "Failed to send SMS");
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Message ID",
      dataIndex: "api_response",
      render: (data) => data?.message_id || "N/A",
    },
    {
      title: "Phone Number",
      dataIndex: "number",
    },
    {
      title: "Message",
      dataIndex: "message",
      ellipsis: true,
    },
    {
      title: "Send From",
      dataIndex: "send_from",
    },
    {
      title: "API Response",
      dataIndex: "api_response",
      render: (data) => data?.success_message || "N/A",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date) => {
        const d = new Date(date);

        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, "0");
        const seconds = d.getSeconds().toString().padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* ================= PAGE TITLE ================= */}
      <Title level={4} style={{ marginBottom: 16 }}>
        SMS History
      </Title>

      {/* ================= FILTER + ACTION ================= */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by number"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          onPressEnter={() => fetchSms(1, pagination.pageSize)}
          allowClear
        />

        <Input
          placeholder="Send from"
          value={sendFrom}
          onChange={(e) => setSendFrom(e.target.value)}
          onPressEnter={() => fetchSms(1, pagination.pageSize)}
          allowClear
        />

        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Send SMS <SendOutlined/>
        </Button>
      </Space>

      {/* ================= TABLE ================= */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* ================= SEND SMS MODAL ================= */}
      <Modal
        title="Send New SMS"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSendSms}
        okText="Send"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Phone Number"
            name="number"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input placeholder="017XXXXXXXX" maxLength={11}/>
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Message is required" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter message" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmsHistory;
