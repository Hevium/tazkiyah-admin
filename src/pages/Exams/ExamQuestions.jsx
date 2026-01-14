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
  Pagination,
  Statistic,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut, apiDelete } from "../../api/apiInstances";
import RichTextEditor from "../../components/RichTextEditor";

const { Title, Text } = Typography;

export default function ExamQuestions() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  

  /* -------------------- STATE -------------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [exam, setExam] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [editForm] = Form.useForm();

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
  /* -------------------- FETCH QUESTIONS -------------------- */
  const fetchQuestions = useCallback(
    async (page = 1, searchText = "") => {
      if (!examId) return;

      try {
        setLoading(true);

        const res = await apiGet.get(`/api/admin/questions`, {
          params: {
            exam_id: examId,
            page,
            limit: pagination.limit,
            search: searchText,
          },
        });

        setQuestions(res.data.data || []);
        setPagination({
          page: res.data.pagination.page,
          limit: res.data.pagination.limit,
          total: res.data.pagination.total,
        });
      } catch (err) {
        console.error(err);
        message.error("Questions load failed");
      } finally {
        setLoading(false);
      }
    },
    [examId, pagination.limit]
  );

  useEffect(() => {
    if (!examId) return;
    fetchExam();
    fetchQuestions(1, "");
  }, [examId, fetchExam, fetchQuestions]);

  /* -------------------- DELETE -------------------- */
  const onDelete = async (questionId) => {
    try {
      await apiDelete.delete(`/api/admin/questions/${questionId}`);
      message.success("Question deleted");
      fetchQuestions(pagination.page, search);
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  /* -------------------- EDIT -------------------- */
  const openEdit = (q) => {
    setEditingQuestion(q);

    editForm.setFieldsValue({
      title: q.question_title,
      options: q.options.map((o) => o.text),
      correct: q.options.findIndex((o) => o.is_correct),
      explanation: q.explanation?.note || "",
    });

    setEditOpen(true);
  };

  const onEditSave = async () => {
    try {
      const values = await editForm.validateFields();

      const payload = {
        question_title: values.title,
        options: values.options.map((text, idx) => ({
          text,
          is_correct: idx === values.correct,
        })),
        explanation: {
          note: values.explanation || "",
        },
      };

      setSaving(true);

      await apiPut.put(`/api/admin/questions/${editingQuestion._id}`, payload);

      message.success("Question updated");
      setEditOpen(false);
      setEditingQuestion(null);
      fetchQuestions(pagination.page, search);
    } catch (err) {
      if (err?.errorFields) return;
      console.error(err);
      message.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <>
            <Title level={4} style={{ marginBottom: 0 }}>
              {exam?.exam_title || "Exam Questions"}
            </Title>
            <Text type="secondary">Exam ID: {examId}</Text>
          </>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(`/admin/exams/${examId}/`)}>Back</Button>
            {exam?.exam_status === "draft" && <Button
              type="primary"
              onClick={() => navigate(`/admin/exams/${examId}/questions/add`)}
            >
              Add Question
            </Button>}
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* ---------- SUMMARY ---------- */}
            <Row gutter={16}>
              {/* Question Limit */}
              <Col span={8} style={{ display: "flex" }}>
                <Card style={{ width: "100%" }}>
                  <Statistic
                    title="Question Limit"
                    value={exam?.total_question || 0}
                  />
                </Card>
              </Col>

              {/* Added Questions */}
              <Col span={8} style={{ display: "flex" }}>
                <Card style={{ width: "100%" }}>
                  <Statistic
                    title={
                      <Space size={6}>
                        <Text type="secondary">Added Questions</Text>
                        {search && <Tag color="blue">Filtered</Tag>}
                      </Space>
                    }
                    value={pagination.total}
                  />

                  {search && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Showing results for "{search}"
                    </Text>
                  )}
                </Card>
              </Col>

              {/* Progress */}
              <Col span={8} style={{ display: "flex" }}>
                <Card style={{ width: "100%" }}>
                  <Statistic
                    title="Progress"
                    value={
                      exam?.total_question
                        ? Math.round(
                            (pagination.total / exam.total_question) * 100
                          )
                        : 0
                    }
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>

            {/* ---------- SEARCH ---------- */}
            <Input.Search
              placeholder="Search question..."
              allowClear
              enterButton
              style={{ maxWidth: 400, margin: "16px 0" }}
              onSearch={(value) => {
                setSearch(value);
                fetchQuestions(1, value);
              }}
            />


            {/* ---------- QUESTIONS LIST ---------- */}
            <List
              dataSource={questions}
              locale={{ emptyText: "No questions found" }}
              itemLayout="vertical"
              renderItem={(q, index) => (
                <Card
                  key={q._id}
                  style={{ marginBottom: 16, borderRadius: 10 }}
                  actions={[
                    <Button type="link" onClick={() => openEdit(q)}>
                      Edit
                    </Button>,
                    <Popconfirm
                      title="Delete this question?"
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => onDelete(q._id)}
                    >
                      <Button type="link" danger>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Title level={5}>
                    {(pagination.page - 1) * pagination.limit + index + 1}.{" "}
                    {q.question_title}
                  </Title>

                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        borderRadius: 6,
                        border: `1px solid ${
                          opt.is_correct ? "#52c41a" : "#d9d9d9"
                        }`,
                        background: opt.is_correct ? "#f6ffed" : "#fafafa",
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <strong>{String.fromCharCode(65 + i)}.</strong>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                      {opt.is_correct && <Tag color="green">Correct</Tag>}
                    </div>
                  ))}

                  {q.explanation?.note && (
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Explanation:</Text>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: q.explanation.note,
                        }}
                      />
                    </div>
                  )}
                </Card>
              )}
            />

            {/* ---------- PAGINATION ---------- */}
            {pagination.total > pagination.limit && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  showSizeChanger={false}
                  onChange={(page) => {
                    setPagination((prev) => ({ ...prev, page }));
                    fetchQuestions(page, search);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ---------- EDIT MODAL ---------- */}
      <Modal
        title="Edit Question"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={onEditSave}
        confirmLoading={saving}
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item label="Question" name="title" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.List name="options">
            {(fields) =>
              fields.map((field, idx) => (
                <Form.Item
                  key={field.key}
                  label={`Option ${String.fromCharCode(65 + idx)}`}
                  name={field.name}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              ))
            }
          </Form.List>

          <Form.Item
            label="Correct Answer"
            name="correct"
            rules={[{ required: true }]}
          >
            <Segmented
              options={[
                { label: "A", value: 0 },
                { label: "B", value: 1 },
                { label: "C", value: 2 },
                { label: "D", value: 3 },
              ]}
            />
          </Form.Item>

          <Form.Item label="Explanation" name="explanation">
            <RichTextEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
