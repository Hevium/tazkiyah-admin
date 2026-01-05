import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  message,
} from "antd";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/apiInstances";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const CreateExam = ({ onCreated }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // watch values for computed fields / conditional UI
  const totalQuestion = Form.useWatch("total_question", form) || 0;
  const markPerQuestion = Form.useWatch("mark_per_question", form) || 0;
  const passMarks = Form.useWatch("pass_marks", form) || 0;
  const accessType = Form.useWatch("access_type", form) || "free";
  const allowMultiple = Form.useWatch("allow_multiple_attempts", form) || false;
  const negativeEnabled = Form.useWatch("negative_enabled", form) || false;
  const negativePerQ = Form.useWatch("negative_per_question", form) || 0;

  const totalMarks = useMemo(() => {
    const tq = Number(totalQuestion || 0);
    const mpq = Number(markPerQuestion || 0);
    return tq * mpq;
  }, [totalQuestion, markPerQuestion]);

  const resetForm = () => {
    setError(null);
    form.resetFields();
    // sensible defaults
    form.setFieldsValue({
      access_type: "free",
      mark_per_question: 1,
      shuffle_questions: false,
      allow_multiple_attempts: false,
      save_multiple_attempts: false,
      negative_enabled: false,
      negative_per_question: 0,
    });
  };

  const validateBusinessRules = () => {
    // Rule 1: pass_marks <= total_marks
    if (Number(passMarks) > Number(totalMarks)) {
      message.error("Pass marks cannot exceed total marks.");
      return false;
    }

    // Rule 2: allow_multiple_attempts = false => save_multiple_attempts must be false
    if (!allowMultiple) {
      const saveMultiple = form.getFieldValue("save_multiple_attempts");
      if (saveMultiple) {
        message.error(
          "Save multiple attempts cannot be enabled when multiple attempts is disabled."
        );
        return false;
      }
    }

    // Rule 3: negative_per_question < mark_per_question when negative marking enabled
    if (negativeEnabled) {
      const n = Number(negativePerQ || 0);
      const mpq = Number(markPerQuestion || 0);
      if (n <= 0) {
        message.error("Negative per question must be greater than 0.");
        return false;
      }
      if (mpq <= 0) {
        message.error("Mark per question must be set before negative marking.");
        return false;
      }
      if (n >= mpq) {
        message.error("Negative per question must be less than mark per question.");
        return false;
      }
    }

    // Rule 4: paid => price required
    if (accessType === "paid") {
      const price = Number(form.getFieldValue("price") || 0);
      if (!(price > 0)) {
        message.error("Price is required for paid exams.");
        return false;
      }
    }

    return true;
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const values = await form.validateFields();

      if (!validateBusinessRules()) return;

      // build payload based on spec
      const payload = {
        exam_title: values.exam_title,
        duration_minutes: values.duration_minutes,
        total_question: values.total_question,
        mark_per_question: values.mark_per_question,
        pass_marks: values.pass_marks,

        // optional objects
        exam_content: {
          exam_description: values.exam_description || "",
          exam_banner: values.exam_banner || "",
          exam_instructions: values.exam_instructions || "",
        },

        settings: {
          shuffle_questions: !!values.shuffle_questions,
          allow_multiple_attempts: !!values.allow_multiple_attempts,
          save_multiple_attempts: !!values.save_multiple_attempts,
          negative_marking: {
            enabled: !!values.negative_enabled,
            per_question: values.negative_enabled
              ? Number(values.negative_per_question || 0)
              : 0,
          },
        },

        access_type: values.access_type,
        price: values.access_type === "paid" ? Number(values.price || 0) : 0,
      };

      const res = await apiGet.post("/api/exams", payload);

      // success expected: { success: true, exam_id: "..." }
      message.success("Exam created successfully.");
      onCreated?.(res?.data); // optional callback (navigate/list reload)

      resetForm();
    } catch (err) {
      // validation errors already shown by antd
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create exam. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // initial defaults (run once when first render)
  // instead of useEffect, we can just set defaults if empty:
  if (!form.getFieldValue("access_type")) {
    // safe default fill
    form.setFieldsValue({
      access_type: "free",
      mark_per_question: 1,
      shuffle_questions: false,
      allow_multiple_attempts: false,
      save_multiple_attempts: false,
      negative_enabled: false,
      negative_per_question: 0,
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            Create Exam
          </Title>
          <Text type="secondary">
            Fill in exam details, settings and pricing. (API-ready)
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={resetForm} disabled={submitting}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={onSubmit}
          >
            Create
          </Button>
        </Space>
      </Space>

      <Card style={{ marginTop: 16 }}>
        {error && (
          <Alert
            style={{ marginBottom: 16 }}
            title="Error"
            description={error}
            type="error"
            showIcon
          />
        )}

        <Form form={form} layout="vertical">
          {/* ===== Basic Info ===== */}
          <Title level={5} style={{ marginTop: 0 }}>
            Basic Information
          </Title>

          <Row gutter={12}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Exam Title"
                name="exam_title"
                rules={[{ required: true, message: "Exam title is required" }]}
              >
                <Input placeholder="e.g. General Islamic Quiz – Level 1" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Duration (minutes)"
                name="duration_minutes"
                rules={[{ required: true, message: "Duration is required" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Total Questions"
                name="total_question"
                rules={[{ required: true, message: "Total questions is required" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Mark per Question"
                name="mark_per_question"
                rules={[{ required: true, message: "Mark per question is required" }]}
              >
                <InputNumber min={0.25} step={0.25} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Pass Marks"
                name="pass_marks"
                rules={[{ required: true, message: "Pass marks is required" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Text type="secondary">
            Total Marks (auto):{" "}
            <Text strong>{Number.isFinite(totalMarks) ? totalMarks : 0}</Text>
          </Text>

          <Divider />

          {/* ===== Pricing ===== */}
          <Title level={5} style={{ marginTop: 0 }}>
            Pricing
          </Title>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Access Type"
                name="access_type"
                rules={[{ required: true, message: "Access type is required" }]}
              >
                <Select
                  options={[
                    { label: "Free", value: "free" },
                    { label: "Paid", value: "paid" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              {accessType === "paid" ? (
                <Form.Item
                  label="Price (৳)"
                  name="price"
                  rules={[{ required: true, message: "Price is required for paid exams" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              ) : (
                <Form.Item label="Price (৳)">
                  <InputNumber disabled value={0} style={{ width: "100%" }} />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Divider />

          {/* ===== Settings ===== */}
          <Title level={5} style={{ marginTop: 0 }}>
            Settings
          </Title>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Shuffle Questions"
                name="shuffle_questions"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Allow Multiple Attempts"
                name="allow_multiple_attempts"
                valuePropName="checked"
              >
                <Switch
                  onChange={(checked) => {
                    if (!checked) {
                      form.setFieldsValue({ save_multiple_attempts: false });
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Save Multiple Attempts"
                name="save_multiple_attempts"
                valuePropName="checked"
                tooltip="If multiple attempts is off, this must be off"
              >
                <Switch disabled={!allowMultiple} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Negative Marking"
                name="negative_enabled"
                valuePropName="checked"
              >
                <Switch
                  onChange={(checked) => {
                    if (!checked) {
                      form.setFieldsValue({ negative_per_question: 0 });
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              {negativeEnabled ? (
                <Form.Item
                  label="Negative per Question"
                  name="negative_per_question"
                  rules={[
                    { required: true, message: "Negative per question is required" },
                  ]}
                  tooltip="Must be less than mark per question"
                >
                  <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
                </Form.Item>
              ) : null}
            </Col>
          </Row>

          <Divider />

          {/* ===== Content ===== */}
          <Title level={5} style={{ marginTop: 0 }}>
            Exam Content (Optional)
          </Title>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Description" name="exam_description">
                <TextArea rows={3} placeholder="Short description about the exam" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Instructions" name="exam_instructions">
                <TextArea rows={3} placeholder="Shown before exam starts" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Banner URL" name="exam_banner">
            <Input placeholder="https://..." />
          </Form.Item>

          {/* Mobile spacing */}
          {isMobile ? <div style={{ height: 8 }} /> : null}
        </Form>
      </Card>
    </div>
  );
};

export default CreateExam;
