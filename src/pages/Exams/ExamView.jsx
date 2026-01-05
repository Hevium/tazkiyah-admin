import {
  Card,
  Tag,
  Row,
  Col,
  Descriptions,
  Button,
  Space,
  Spin,
  Modal,
  Upload,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../../api/apiInstances";
import EditExamModal from "../../components/EditExamModal";

const ExamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerDeleting, setBannerDeleting] = useState(false);

  const [bannerFileList, setBannerFileList] = useState([]);

  const fetchExam = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

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

  const currentBannerUrl = exam.exam_content?.exam_banner || "";

  const handleDeleteBanner = async () => {
    if (!id) return;
    if (!currentBannerUrl) {
      message.info("Please upload the banner first and then delete it.");
      return;
    }

    try {
      setBannerDeleting(true);
      const res = await apiPut.put(`/api/admin/exams/${id}`, {
        exam_content: {
          ...(exam.exam_content || {}),
          exam_banner: "",
        },
      });

      setExam(res.data.data);
      message.success("Banner deleted");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete banner");
    } finally {
      setBannerDeleting(false);
    }
  };

  const openBannerModal = () => {
    setBannerFileList([]);
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!id) return;

    const picked = bannerFileList?.[0]?.originFileObj;
    if (!picked) {
      message.info("Please select an image");
      return;
    }

    if (!picked.type?.startsWith("image/")) {
      message.error("Only image files are allowed");
      return;
    }

    // keep it safe for JSON payloads
    const maxBytes = 2 * 1024 * 1024;
    if (picked.size > maxBytes) {
      message.error("Image must be 2MB or less");
      return;
    }

    try {
      setBannerSaving(true);

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(picked);
      });

      const res = await apiPut.put(`/api/admin/exams/${id}`, {
        exam_content: {
          ...(exam.exam_content || {}),
          exam_banner: dataUrl,
        },
      });

      setExam(res.data.data);
      setBannerModalOpen(false);
      message.success("Banner updated");
    } catch (err) {
      console.error(err);
      message.error("Failed to update banner");
    } finally {
      setBannerSaving(false);
    }
  };

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
            backgroundImage: currentBannerUrl
              ? `url(${currentBannerUrl})`
              : "linear-gradient(135deg, #1677ff, #69b1ff)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Space style={{ padding: "12px 16px" }}>
          <Button danger loading={bannerDeleting} onClick={handleDeleteBanner}>
            Delete banner
          </Button>

          <Button type="primary" onClick={openBannerModal}>
            Upload banner
          </Button>
        </Space>
      </Card>

      <Modal
        title="Upload banner"
        open={bannerModalOpen}
        onCancel={() => setBannerModalOpen(false)}
        onOk={handleSaveBanner}
        okText="Save"
        confirmLoading={bannerSaving}
        destroyOnClose
      >
        <Upload
          accept="image/*"
          maxCount={1}
          beforeUpload={() => false}
          fileList={bannerFileList}
          onChange={({ fileList }) => setBannerFileList(fileList.slice(-1))}
        >
          <Button>Select image</Button>
        </Upload>

        {bannerFileList?.[0]?.originFileObj && (
          <div style={{ marginTop: 12 }}>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Name">
                {bannerFileList[0].originFileObj.name}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {bannerFileList[0].originFileObj.type || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {(bannerFileList[0].originFileObj.size / 1024).toFixed(1)} KB
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

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

      {/* ================= QUESTION UPLOAD ================= */}
      <Card title="Questions" style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Upload your question set
            </div>
            <div style={{ color: "rgba(0,0,0,.45)" }}>
              Click upload to add questions for this exam.
            </div>
          </Col>

          <Col>
            <Button
              type="primary"
              onClick={() => navigate(`/admin/exams/${id}/questions`)}
            >
              Upload
            </Button>
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
