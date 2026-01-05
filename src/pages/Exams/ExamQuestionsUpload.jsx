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
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function ExamQuestionsUpload() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      // TODO: Connect to API when question schema/endpoint is ready
      console.log("Question submit", { examId: id, ...values });
      message.success("Question ready to submit");
      form.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      console.error(err);
      message.error("Failed to submit");
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
          <Button onClick={() => navigate(`/admin/exams/${id}`)}>Back</Button>
        }
        style={{ margin: "0 auto", maxWidth: 720 }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Text type="secondary">
            Fill in the question, options, and select the correct answer.
          </Text>

          <Form form={form} layout="vertical">
            <Form.Item
              label="Question title"
              name="title"
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

            <Space style={{ marginTop: 8 }}>
              <Button type="primary" onClick={onSubmit}>
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
