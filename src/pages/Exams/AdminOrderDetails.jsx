import {
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Tag,
  Spin,
  Timeline,
  List,
  Button,
  Select,
  Input,
  InputNumber,
  message,
  Modal,
  Alert,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../api/apiInstances";
import OrderTransaction from "../../components/OrderTransaction";

const { Title, Text } = Typography;
const { Option } = Select;

/* ================= CONFIG ================= */

const DELIVERY_CHARGE = {
  inside_dhaka: 60,
  outside_dhaka: 120,
};

const BASE_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "in_transit",
  "at_delivery_hub",
];

const TERMINAL_FLOWS = {
  delivered: [...BASE_FLOW, "delivered"],
  returned: [...BASE_FLOW, "returned"],
  cancelled: ["pending", "confirmed", "cancelled"],
};

const STEP_LABELS = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  in_transit: "In Transit",
  at_delivery_hub: "At Delivery Hub",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

/* ================= COMPONENT ================= */

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [originalOrder, setOriginalOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* ===== PAYMENT STATE ===== */
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm] = Form.useForm();

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiGet.get(`/api/orders/student/details/${orderId}`);
        setOrder(res.data.data);
        setOriginalOrder(structuredClone(res.data.data));
      } catch {
        message.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  /* ================= SAFE GUARD ================= */

  if (loading) {
    return (
      <Row justify="center" style={{ marginTop: 80 }}>
        <Spin size="large" />
      </Row>
    );
  }

  if (!order) return null;

  /* ================= FLOW LOGIC ================= */

  const getOrderFlow = (status) => {
    if (TERMINAL_FLOWS[status]) return TERMINAL_FLOWS[status];
    if (BASE_FLOW.includes(status)) return BASE_FLOW;
    return [...BASE_FLOW, status];
  };

  const flow = getOrderFlow(order.order_status);
  const currentIndex = flow.indexOf(order.order_status);

  /* ================= HELPERS ================= */

  const updateField = (path, value) => {
    setOrder((prev) => {
      const updated = structuredClone(prev);
      const keys = path.split(".");
      let obj = updated;
      keys.slice(0, -1).forEach((k) => (obj = obj[k]));
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const recalculateTotal = (data) => {
    data.pricing.grand_total =
      data.pricing.sub_total +
      data.pricing.delivery_charge -
      (data.special_discount || 0);
  };

  const handleDeliveryChange = (type) => {
    const updated = structuredClone(order);
    const charge = DELIVERY_CHARGE[type];

    updated.delivery.type = type;
    updated.delivery.charge = charge;
    updated.pricing.delivery_charge = charge;

    recalculateTotal(updated);
    setOrder(updated);
  };

  const handleDiscountChange = (value) => {
    const updated = structuredClone(order);
    updated.special_discount = value || 0;
    recalculateTotal(updated);
    setOrder(updated);
  };

  /* ================= EDIT CONTROLS ================= */

  const handleEdit = () => {
    setOriginalOrder(structuredClone(order));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setOrder(structuredClone(originalOrder));
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = structuredClone(order);
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;

      await apiPut.put(`/api/admin/orders/update/${orderId}`, payload);

      message.success("Order updated successfully");
      setIsEditing(false);
    } catch {
      message.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  /* ================= Handle Payment ================= */
  const handlePayment = async (values) => {
    try {
      const { amount, payment_type } = values;

      const payload = {
        amount: Math.abs(amount),
        payment_type,
        transaction_from: "order",
        reference: order?.order_id,
      };

      await apiPost.post("/api/admin/transactions", payload);

      message.success("Payment added successfully");

      setPaymentModalOpen(false);
      paymentForm.resetFields();
    } catch (error) {
      console.error("Payment Error:", error);

      message.error(error?.response?.data?.message || "Failed to add payment");
    }
  };

  /* ================= JSX ================= */

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Row gutter={8}>
          <Col>
            <Button onClick={() => setPaymentModalOpen(true)}>
              Make a Payment
            </Button>
          </Col>

          {!isEditing ? (
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Col>
          ) : (
            <>
              <Col>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Row>

      <Title level={3}>Order Details</Title>

      {/* SUMMARY */}
      <Card style={{ marginBottom: 24 }}>
        <Text strong>Order ID:</Text> {order.order_id}
        <br />
        <Text strong>Date:</Text>{" "}
        {dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")}
        <br />
        <Text strong>Status:</Text>{" "}
        {isEditing ? (
          <Select
            value={order.order_status}
            style={{ width: 220 }}
            onChange={(v) => updateField("order_status", v)}
          >
            {[...BASE_FLOW, "delivered", "returned", "cancelled"].map((s) => (
              <Option key={s} value={s}>
                {s.toUpperCase()}
              </Option>
            ))}
          </Select>
        ) : (
          <Tag color="blue">{order.order_status.toUpperCase()}</Tag>
        )}
      </Card>

      {/* TRACKING */}
      <Card title="Order Tracking" style={{ marginBottom: 24 }}>
        <Timeline>
          {flow.map((status, index) => (
            <Timeline.Item
              key={status}
              color={
                status === "cancelled"
                  ? "red"
                  : status === "returned"
                  ? "orange"
                  : index < currentIndex
                  ? "green"
                  : index === currentIndex
                  ? "blue"
                  : "gray"
              }
              dot={
                index <= currentIndex ? (
                  <CheckCircleFilled />
                ) : (
                  <ClockCircleOutlined />
                )
              }
            >
              <Text strong>{STEP_LABELS[status]}</Text>
              <br />
              <Text type="secondary">
                {index < currentIndex
                  ? "Completed"
                  : index === currentIndex
                  ? "Current Stage"
                  : "Pending"}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* DELIVERY */}
      <Card title="Delivery Information" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col md={8}>
            <Text strong>Delivery Type</Text>
            <Select
              value={order.delivery.type}
              onChange={handleDeliveryChange}
              style={{ width: "100%" }}
              disabled={!isEditing}
            >
              <Option value="inside_dhaka">Inside Dhaka</Option>
              <Option value="outside_dhaka">Outside Dhaka</Option>
            </Select>
          </Col>

          <Col md={8}>
            <Text strong>Delivery Charge</Text>
            <InputNumber
              value={order.pricing.delivery_charge}
              disabled
              style={{ width: "100%" }}
            />
          </Col>

          <Col md={8}>
            <Text strong>ETA</Text>
            <Input
              disabled={!isEditing}
              value={order.delivery.eta}
              onChange={(e) => updateField("delivery.eta", e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {/* CUSTOMER */}
      <Card title="Customer Information" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col md={8}>
            <Text strong>Name</Text>
            <Input
              disabled={!isEditing}
              value={order.customer.name}
              onChange={(e) => updateField("customer.name", e.target.value)}
            />
          </Col>

          <Col md={8}>
            <Text strong>Phone</Text>
            <Input disabled value={order.customer.phone} />
          </Col>

          <Col md={8}>
            <Text strong>Address</Text>
            <Input
              disabled={!isEditing}
              value={order.customer.address}
              onChange={(e) => updateField("customer.address", e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {/* DISCOUNT */}
      <Card title="Special Discount" style={{ marginBottom: 24 }}>
        <InputNumber
          min={0}
          disabled={!isEditing}
          value={order.special_discount}
          onChange={handleDiscountChange}
          addonAfter="৳"
        />
      </Card>

      {/* ITEMS */}
      <Card title="Ordered Items" style={{ marginBottom: 24 }}>
        <List
          dataSource={order.items}
          renderItem={(item) => (
            <List.Item>
              <Row style={{ width: "100%" }}>
                <Col span={14}>
                  {item.title} × {item.quantity}
                </Col>
                <Col span={10} style={{ textAlign: "right" }}>
                  ৳{item.total_price}
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Card>
      
      
      {/* TOTAL */}
      <Card style={{marginBottom: 24}}>
        <Row justify="end">
          <Col>
            <Text>Subtotal: ৳{order.pricing.sub_total}</Text>
            <br />
            <Text>Delivery: ৳{order.pricing.delivery_charge}</Text>
            <br />
            <Text>Discount: −৳{order.special_discount}</Text>
            <Divider />
            <Text strong>Grand Total: ৳{order.pricing.grand_total}</Text>
          </Col>
        </Row>
      </Card>

      {/* Order Transaction */}
      <OrderTransaction reference = {orderId}/>

      {/* PAYMENT MODAL */}
      <Modal
        title="Make a Payment"
        open={paymentModalOpen}
        okText="Submit Payment"
        onCancel={() => {
          setPaymentModalOpen(false);
          paymentForm.resetFields();
        }}
        onOk={() => paymentForm.submit()}
      >
        <Alert
          message="You can add only a single transaction at a time."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={paymentForm} layout="vertical" onFinish={handlePayment}>
          <Form.Item
            label="Payment Type"
            name="payment_type"
            initialValue="revenue"
            rules={[{ required: true, message: "Select payment type" }]}
          >
            <Select>
              <Option value="revenue">Revenue</Option>
              <Option value="loss">Loss</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: "Enter amount" },
              {
                validator: (_, value) =>
                  value === 0
                    ? Promise.reject("Amount cannot be zero or less.")
                    : Promise.resolve(),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              addonAfter="৳"
              placeholder="Enter amount"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOrderDetails;
