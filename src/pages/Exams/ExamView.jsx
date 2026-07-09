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
  Popconfirm,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiDelete, apiGet, apiPut } from "../../api/apiInstances";
import EditExamModal from "../../components/EditExamModal";
import {
  BulbOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LineChartOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

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
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchExam = useCallback(async () => {
    if (!id) return;
    try {
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

  const currentBannerUrl = exam.exam_content?.exam_banner
    ? `${BASE_URL}${exam.exam_content.exam_banner}`
    : null;

  const openBannerModal = () => {
    setBannerFileList([]);
    setBannerModalOpen(true);
  };

  // Upload banner
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

    const maxBytes = 2 * 1024 * 1024;
    if (picked.size > maxBytes) {
      message.error("Image must be 2MB or less");
      return;
    }

    try {
      setBannerSaving(true);

      const formData = new FormData();
      formData.append("banner", picked);

      const res = await apiPut.put(`/api/admin/exams/banner/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExam(res.data.data);
      setBannerModalOpen(false);
      message.success("Banner uploaded");
    } catch (err) {
      console.error(err);
      message.error("Failed to upload banner");
    } finally {
      setBannerSaving(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async () => {
    if (!id) return;
    if (!currentBannerUrl) {
      message.info("Please upload the banner first and then delete it.");
      return;
    }

    try {
      setBannerDeleting(true);
      const res = await apiDelete.delete(`/api/admin/exams/banner/${id}`);

      setExam(res.data.data);
      message.success("Banner deleted");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete banner");
    } finally {
      setBannerDeleting(false);
    }
  };

  const totalMarks = exam.total_marks;

  const formattedExamDateTime = (() => {
    if (!exam?.exam_datetime) return "-";
    const date = new Date(exam.exam_datetime);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  })();
  const formattedRegistrationDateTime = (() => {
    if (!exam?.registration_end_datetime) return "-";
    const date = new Date(exam.registration_end_datetime);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  })();

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
              : "linear-gradient(135deg, #003610ff, #69ff96ff)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Space style={{ padding: "12px 0" }}>
          {currentBannerUrl ? (
            <Popconfirm
              title="Are you sure?"
              description="This banner will be permanently deleted."
              okText="Yes, delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: bannerDeleting }}
              onConfirm={handleDeleteBanner}
            >
              <Button danger loading={bannerDeleting}>
                <DeleteOutlined />
                Delete banner
              </Button>
            </Popconfirm>
          ) : (
            <Button type="primary" onClick={openBannerModal}>
              <UploadOutlined /> Upload banner
            </Button>
          )}
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
              <Tag color="blue" className="text_capitalized">
                {exam.exam_status}
              </Tag>
              <Tag
                color={exam.access_type === "paid" ? "gold" : "green"}
                className="text_capitalized"
              >
                {exam.access_type}
              </Tag>
              {exam.access_type === "paid" && <Tag>৳ {exam.price}</Tag>}
            </Space>
          </Col>

          <Col>
            <Space>
              <Button onClick={() => setEditOpen(true)}>
                <EditOutlined /> Edit Exam
              </Button>
              <Button
                onClick={() => navigate(`/admin/exams/${id}/enrollments`)}
              >
                <CheckCircleOutlined /> View Enrollment
              </Button>
                <Button
                  onClick={() => navigate(`/admin/exams/${id}/leaderboard`)}
                >
                  <LineChartOutlined /> View Leaderboard
                </Button>
              <Button
                type="primary"
                onClick={() => navigate(`/admin/exams/${id}/questions`)}
              >
                <BulbOutlined /> View Question
              </Button>
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
          <Descriptions.Item label="Registration Date & Time">
            {formattedRegistrationDateTime}
          </Descriptions.Item>
          <Descriptions.Item label="Exam Date & Time">
            {formattedExamDateTime}
          </Descriptions.Item>
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
          <Descriptions.Item label="Result Published">
            {exam.result_status === "published" ? "Yes" : "No"}
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
