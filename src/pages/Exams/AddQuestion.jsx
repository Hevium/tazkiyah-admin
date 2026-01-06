import {
  Card,
  Button,
  Space,
  Typography,
  Form,
  Input,
  Row,
  Col,
  Segmented,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../../api/apiInstances";
import RichTextEditor from "../../components/RichTextEditor";

const { Title, Text } = Typography;

export default function AddQuestion() {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState(null);

  /* -------------------- FETCH EXAM -------------------- */
  const fetchExam = useCallback(async () => {
    if (!examId) return;
    try {
      const res = await apiGet.get(`/api/admin/exams/${examId}`);
      setExam(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [examId]);

  useEffect(() => {
    if (!examId) return;
    fetchExam();
  }, [examId, fetchExam]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const optionKeys = ["a", "b", "c", "d"];
      const options = optionKeys
        .map((key) => ({
          text: (values.options?.[key] ?? "").trim(),
          is_correct: values.correct === key,
        }))
        .filter((opt) => opt.text.length > 0);

      const payload = {
        exam_id: examId,
        question_title: values.question_title,
        options,
        explanation: {note: values.note}
      };

      await apiPost.post(`/api/admin/questions`, payload);

      message.success("Question added");
      form.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      console.error(err);
      message.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Add Question
          </Title>
        }
        extra={
          <Button onClick={() => navigate(`/admin/exams/${examId}/questions`)}>
            Back
          </Button>
        }
        style={{ margin: "0 auto", maxWidth: 720 }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Exam title:{" "}
          <span style={{ color: "green" }}>{exam?.exam_title || "N/A"}</span>
        </Title>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Text type="secondary">
            Fill in the question, options, and select the correct answer.
          </Text>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              correct: "a",
            }}
          >
            <Form.Item
              label="Question title"
              name="question_title"
              rules={[
                { required: true, message: "Question title is required" },
              ]}
            >
              <Input.TextArea rows={2} placeholder="Write the question..." />
            </Form.Item>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Option A"
                  name={["options", "a"]}
                  rules={[{ required: true, message: "Option A is required" }]}
                >
                  <Input placeholder="Option A" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Option B"
                  name={["options", "b"]}
                  rules={[{ required: true, message: "Option B is required" }]}
                >
                  <Input placeholder="Option B" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Option C"
                  name={["options", "c"]}
                  rules={[{ required: true, message: "Option C is required" }]}
                >
                  <Input placeholder="Option C" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Option D"
                  name={["options", "d"]}
                  rules={[{ required: true, message: "Option D is required" }]}
                >
                  <Input placeholder="Option D" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Correct answer"
              name="correct"
              rules={[{ required: true, message: "Select the correct answer" }]}
              valuePropName="value"
              trigger="onChange"
              getValueFromEvent={(value) => value}
              validateTrigger="onChange"
            >
              <Segmented
                options={[
                  { label: "A", value: "a" },
                  { label: "B", value: "b" },
                  { label: "C", value: "c" },
                  { label: "D", value: "d" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Explanation" name="note">
              <RichTextEditor />
            </Form.Item>

            <Space style={{ marginTop: 8 }}>
              <Button type="primary" onClick={onSubmit} loading={submitting}>
                Submit
              </Button>
              <Button onClick={() => form.resetFields()}>Clear</Button>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
