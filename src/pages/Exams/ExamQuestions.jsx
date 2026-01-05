import {
  Button,
  Card,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  Popconfirm,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Segmented,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/apiInstances";

const { Title, Text } = Typography;

export default function ExamQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm] = Form.useForm();

  const fetchQuestions = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiGet.get(`/api/admin/exams/${id}`);
      const exam = res.data.data;
      setExamTitle(exam?.exam_title || "");
      setQuestions(Array.isArray(exam?.questions) ? exam.questions : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const persistQuestions = async (nextQuestions) => {
    if (!id) return;
    try {
      setSaving(true);
      await apiPut.put(`/api/admin/exams/${id}`, {
        questions: nextQuestions,
      });
      setQuestions(nextQuestions);
      message.success("Saved");
    } catch (err) {
      console.error(err);
      message.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (questionId) => {
    const next = (questions || []).filter((q) => q?._id !== questionId);
    await persistQuestions(next);
  };

  const openEdit = (q) => {
    setEditingQuestionId(q?._id || null);
    editForm.setFieldsValue({
      title: q?.title || "",
      options: {
        a: q?.options?.a || "",
        b: q?.options?.b || "",
        c: q?.options?.c || "",
        d: q?.options?.d || "",
      },
      correct: q?.correct || "a",
    });
    setEditOpen(true);
  };

  const onEditSave = async () => {
    if (!editingQuestionId) return;
    try {
      const values = await editForm.validateFields();
      const next = (questions || []).map((q) => {
        if (q?._id !== editingQuestionId) return q;
        return {
          ...q,
          title: values.title,
          options: values.options,
          correct: values.correct,
        };
      });
      await persistQuestions(next);
      setEditOpen(false);
      setEditingQuestionId(null);
    } catch (err) {
      if (err?.errorFields) return;
      console.error(err);
      message.error("Failed to update");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        style={{ margin: "0 auto", maxWidth: 900 }}
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Questions
            </Title>
            <Text type="secondary">
              {examTitle ? `Exam: ${examTitle}` : ""}
            </Text>
          </div>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(`/admin/exams/${id}`)}>Back</Button>
            <Button
              type="primary"
              onClick={() => navigate(`/admin/exams/${id}/questions/add`)}
            >
              Add question
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={questions}
            locale={{ emptyText: "No questions found" }}
            pagination={{
              pageSize: 15,
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
            renderItem={(q, idx) => (
              <List.Item
                actions={[
                  <Button key="edit" onClick={() => openEdit(q)}>
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete this question?"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDelete(q?._id)}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ width: "100%" }}>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {idx + 1}. {q?.title || "(Untitled)"}
                      </div>
                      <Text type="secondary">
                        A: {q?.options?.a || "-"} | B: {q?.options?.b || "-"} |
                        C: {q?.options?.c || "-"} | D: {q?.options?.d || "-"}
                      </Text>
                    </div>
                    <Tag color="green">
                      Correct: {(q?.correct || "-").toUpperCase()}
                    </Tag>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Edit question"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingQuestionId(null);
        }}
        onOk={onEditSave}
        okText="Save"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ correct: "a" }}
        >
          <Form.Item
            label="Question title"
            name="title"
            rules={[{ required: true, message: "Question title is required" }]}
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
        </Form>
      </Modal>
    </div>
  );
}
