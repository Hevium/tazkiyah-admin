import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Switch,
  Card,
  Row,
  Col,
  Space,
  message,
} from "antd";
import RichTextEditor from "../../components/RichTextEditor";
import { apiPost } from "../../api/apiInstances";
import { useNavigate } from "react-router-dom";

const ExamCreate = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const accessType = Form.useWatch("access_type", form);
  const negativeEnabled = Form.useWatch(
    ["settings", "negative_marking", "enabled"],
    form,
  );

  const onFinish = async (values) => {
    try {
      await apiPost.post("/api/admin/exams", values);

      messageApi.open({
        type: "success",
        content: "Exam created successfully",
        duration: 1.5,
        onClose: () => {
          form.resetFields();
          navigate("/admin/exams");
        },
      });
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message ||
          "Failed to create exam. Please try again.",
      );
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      initialValues={{
        access_type: "free",
        security_control: false,
        settings: {
          shuffle_questions: false,
          negative_marking: {
            enabled: false,
            per_question: 0,
          },
        },
      }}
      style={{ paddingTop: 16, paddingLeft: 16, paddingRight: 16 }}
    >
      {contextHolder}
      {/* ================= PAGE HEADER ================= */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>Create Exam</h2>
        <p style={{ color: "#8c8c8c", margin: 0 }}>
          Set up exam details, scoring rules and access control
        </p>
      </Card>

      {/* ================= BASIC INFO ================= */}
      <Card title="Basic Information" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="Exam Title"
              name="exam_title"
              rules={[{ required: true }]}
            >
              <Input
                size="large"
                placeholder="e.g. Basic Islamic Knowledge Test"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Exam Description"
              name={["exam_content", "exam_description"]}
            >
              <RichTextEditor placeholder="Describe what this exam is about..." />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= EXAM RULES ================= */}
      <Card title="Exam Rules" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Total Questions"
              name="total_question"
              rules={[{ required: true }]}
              tooltip="Total number of questions in this exam, minimum 5 maximum 200"
            >
              <InputNumber
                min={5}
                max={200}
                size="large"
                style={{ width: "100%" }}
                placeholder="e.g. 100"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Duration (minutes)"
              name="duration_minutes"
              rules={[{ required: true }]}
              tooltip="Total time allotted to complete the exam, minimum 5 minutes maximum 180 minutes"
            >
              <InputNumber
                min={5}
                max={180}
                size="large"
                style={{ width: "100%" }}
                placeholder="e.g. 60"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Exam Date & Time"
              name="exam_datetime"
              tooltip="When the exam starts (date and time)"
            >
              <Input size="large" type="datetime-local" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Registration End Date"
              name="registration_end_datetime"
              tooltip="Last date and time for registration"
            >
              <Input size="large" type="datetime-local" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Marks per Question"
              name="mark_per_question"
              rules={[{ required: true }]}
              tooltip="Marks awarded for each correct answer, minimum 1, maximum 10"
            >
              <InputNumber
                min={1}
                max={10}
                size="large"
                style={{ width: "100%" }}
                placeholder="e.g. 1"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Pass Marks"
              name="pass_marks"
              rules={[{ required: true }]}
              tooltip="Minimum marks required to pass the exam, minimum 1"
            >
              <InputNumber
                min={1}
                size="large"
                style={{ width: "100%" }}
                placeholder="e.g. 33"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= SETTINGS ================= */}
      <Card title="Exam Settings" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Form.Item
                label="Shuffle Questions"
                name={["settings", "shuffle_questions"]}
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Form.Item
                label="Security Control"
                name="security_control"
                valuePropName="checked"
                tooltip="Enable anti-cheating protections during the exam."
                extra="May prevent tab switching, copying, and other restricted actions."
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Form.Item
                label="Negative Marking"
                name={["settings", "negative_marking", "enabled"]}
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>

              {negativeEnabled && (
                <Form.Item
                  style={{ marginTop: 16, marginBottom: 0 }}
                  label="Negative Mark"
                  name={["settings", "negative_marking", "per_question"]}
                  extra="Deducted for every wrong answer"
                >
                  <InputNumber min={0} step={0.25} style={{ width: "100%" }} />
                </Form.Item>
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      {/* ================= ACCESS ================= */}
      <Card title="Access Control">
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Access Type"
              name="access_type"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="free">Free</Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {accessType === "paid" && (
            <Col xs={24} md={8}>
              <Form.Item
                label="Exam Price"
                name="price"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Card>

      {/* ================= ACTION BAR ================= */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          padding: "16px",
          marginTop: 24,
          borderTop: "1px solid #f0f0f0",
          textAlign: "right",
        }}
      >
        <Button
          size="large"
          style={{ marginRight: 8 }}
          onClick={() => navigate("/admin/exams")}
        >
          Cancel
        </Button>
        <Button type="primary" size="large" htmlType="submit">
          Create Exam
        </Button>
      </div>
    </Form>
  );
};

export default ExamCreate;
