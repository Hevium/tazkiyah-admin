import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Space,
  message,
  DatePicker,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RichTextEditor from "./RichTextEditor";
import { apiGet, apiPut } from "../api/apiInstances";

const EditExamModal = ({ open, onClose, examId, onUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const accessType = Form.useWatch("access_type", form);
  const negativeEnabled = Form.useWatch(
    ["settings", "negative_marking", "enabled"],
    form
  );
  const [examData, setExamData] = useState({});

  // ================= Fetch Exam =================
  useEffect(() => {
    if (!open || !examId) return;

    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await apiGet.get(`/api/admin/exams/${examId}`);
        const data = res.data.data;
        setExamData(data);

        form.setFieldsValue({
          ...data,
          exam_datetime: data.exam_datetime ? dayjs(data.exam_datetime) : null,
          registration_end_datetime: data.registration_end_datetime
            ? dayjs(data.registration_end_datetime)
            : null,
        });
      } catch {
        messageApi.error("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [open, examId, form, messageApi]);

  // ================= Submit =================
  const onFinish = async (values) => {
    const payload = {
      ...values,
      exam_datetime: values.exam_datetime
        ? values.exam_datetime.toISOString()
        : null,
      registration_end_datetime: values.registration_end_datetime
        ? values.registration_end_datetime.toISOString()
        : null,
    };

    if (!payload.settings?.negative_marking?.enabled) {
      payload.settings.negative_marking.per_question = 0;
    }

    if (payload.access_type !== "paid") {
      payload.price = 0;
    }
    if (examData?.exam_content?.exam_banner) {
      payload.exam_content.exam_banner = examData.exam_content.exam_banner;
    }

    try {
      await apiPut.put(`/api/admin/exams/${examId}`, payload);
      messageApi.open({
        type: "success",
        content: "Exam updated successfully",
        duration: 1.5,
        onClose: () => {
          onUpdated?.();
          onClose();
        },
      });
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to update exam"
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Exam"
        open={open}
        onCancel={onClose}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={900}
        okText="Save Changes"
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* ===== BASIC ===== */}
          <Form.Item
            label="Exam Title"
            name="exam_title"
            rules={[{ required: true, message: "Exam title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Exam Description"
            name={["exam_content", "exam_description"]}
          >
            <RichTextEditor />
          </Form.Item>

          {/* ===== DATE & TIME ===== */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Exam Date & Time"
                name="exam_datetime"
                tooltip="When the exam starts (date and time)"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Registration End Date"
                name="registration_end_datetime"
                tooltip="Last date and time for registration"
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ===== RULES ===== */}
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Total Questions"
                name="total_question"
                rules={[{ required: true }]}
              >
                <InputNumber min={5} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Duration (minutes)"
                name="duration_minutes"
                rules={[{ required: true }]}
              >
                <InputNumber min={5} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Marks / Question"
                name="mark_per_question"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Pass Marks"
                name="pass_marks"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* ===== SETTINGS ===== */}
          <Space size="large" wrap>
            <Form.Item
              label="Shuffle Questions"
              name={["settings", "shuffle_questions"]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Negative Marking"
              name={["settings", "negative_marking", "enabled"]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            {negativeEnabled && (
              <Form.Item
                label="Negative Mark / Question"
                name={["settings", "negative_marking", "per_question"]}
                rules={[{ required: true }]}
              >
                <InputNumber min={0} step={0.25} />
              </Form.Item>
            )}
          </Space>

          {/* ===== ACCESS ===== */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Access Type"
                name="access_type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="free">Free</Select.Option>
                  <Select.Option value="paid">Paid</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {accessType === "paid" && (
              <Col span={8}>
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* ===== STATUS ===== */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Exam Status"
                name="exam_status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                  <Select.Option value="closed">Closed</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Available for Attempt"
                name="attempt_status"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select student attempt status">
                  <Select.Option value="yes">Yes</Select.Option>
                  <Select.Option value="no">No</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Result Status"
                name="result_status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="hidden">Hidden</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            

            <Col span={8}>
              <Form.Item
                label="Leaderboard Status"
                name="leaderboard_status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="hidden">Hidden</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditExamModal;
