import { Card, Tag, Row, Col, Descriptions, Button, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiInstances";
import EditExamModal from "../../components/EditExamModal";

const ExamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchExam = async () => {
    if (!id) return;
    try {
      console.log(id);
      const res = await apiGet.get(`/api/admin/exams/${id}`);
      setExam(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!exam) {
    return <p>Exam not found</p>;
  }

  const totalMarks = exam.total_marks;

  return (
    <div style={{ padding: 16 }}>
      {/* ================= BANNER ================= */}
      <Card
        style={{
          marginBottom: 24,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 220,
            backgroundImage: exam.exam_content?.exam_banner
              ? `url(${exam.exam_content.exam_banner})`
              : "linear-gradient(135deg, #1677ff, #69b1ff)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Card>

      {/* ================= HEADER ================= */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ marginBottom: 4 }}>{exam.exam_title}</h2>
            <Space>
              <Tag color="blue">{exam.exam_status.toUpperCase()}</Tag>
              <Tag color={exam.access_type === "paid" ? "gold" : "green"}>
                {exam.access_type.toUpperCase()}
              </Tag>
              {exam.access_type === "paid" && <Tag>৳ {exam.price}</Tag>}
            </Space>
          </Col>

          <Col>
            <Space>
              <Button onClick={() => setEditOpen(true)}>Edit Exam</Button>

              <Button onClick={() => navigate("/admin/exams")}>Back</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ================= DESCRIPTION ================= */}
      <Card title="Exam Description" style={{ marginBottom: 24 }}>
        <div
          dangerouslySetInnerHTML={{
            __html: exam.exam_content?.exam_description || "",
          }}
        />
      </Card>

      {/* ================= OVERVIEW ================= */}
      <Card title="Exam Overview" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Duration">
            {exam.duration_minutes} minutes
          </Descriptions.Item>
          <Descriptions.Item label="Total Questions">
            {exam.total_question}
          </Descriptions.Item>
          <Descriptions.Item label="Marks per Question">
            {exam.mark_per_question}
          </Descriptions.Item>
          <Descriptions.Item label="Total Marks">
            {totalMarks}
          </Descriptions.Item>
          <Descriptions.Item label="Pass Marks">
            {exam.pass_marks}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ================= SETTINGS ================= */}
      <Card title="Exam Settings">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Shuffle Questions">
            {exam.settings?.shuffle_questions ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Negative Marking">
            {exam.settings?.negative_marking?.enabled
              ? `Yes (-${exam.settings.negative_marking.per_question})`
              : "No"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <EditExamModal
        open={editOpen}
        examId={exam.exam_id}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchExam}
      />
    </div>
  );
};

export default ExamView;
