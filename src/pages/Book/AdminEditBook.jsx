import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Upload,
  Button,
  Typography,
  Divider,
  message,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut, apiUpload } from "../../api/apiInstances";

const { Title, Text } = Typography;
const { Option } = Select;

const MAX_THUMB_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

const AdminEditBook = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { book_id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [thumbUploading, setThumbUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await apiGet.get(`/api/books/${book_id}`);
      setBook(res.data.data);
      form.setFieldsValue({
        ...res.data.data,
        hide_from_list: res.data.data.hide_from_list === "yes",
      });
    } catch (error) {
      message.error(error.message || "Failed to fetch book data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [book_id]);

  /* -------------------------
     UPDATE BOOK TEXT
  --------------------------*/
  const handleTextUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        hide_from_list: values.hide_from_list ? "yes" : "no",
      };

      await apiPut.put(`/api/admin/books/${book_id}`, payload);
      message.success("Book information updated");
      fetchBook();
    } catch (error) {
      message.error(error.message || "Update failed");
    }
  };

  /* -------------------------
     THUMBNAIL VALIDATION
  --------------------------*/
  const beforeThumbnailUpload = (file) => {
    const isImage = file.type === "image/jpeg" || file.type === "image/png";

    if (!isImage) {
      message.error("Only JPG or PNG images are allowed");
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_THUMB_SIZE) {
      message.error("Thumbnail size must be less than 2 MB");
      return Upload.LIST_IGNORE;
    }

    setThumbnailFile(file);
    return false;
  };

  /* -------------------------
     PDF VALIDATION
  --------------------------*/
  const beforePdfUpload = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed");
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_PDF_SIZE) {
      message.error("PDF size must be less than 5 MB");
      return Upload.LIST_IGNORE;
    }

    setPdfFile(file);
    return false;
  };

  /* -------------------------
     UPLOAD THUMBNAIL
  --------------------------*/
  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) return;

    try {
      setThumbUploading(true);

      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);

      await apiUpload.post(
        `/api/admin/books/${book_id}/thumbnail`,
        formData
      );


      message.success("Thumbnail updated");
      setThumbnailFile(null);
      fetchBook();
    } catch (error) {
      console.error(error);
      message.error("Thumbnail upload failed");
    } finally {
      setThumbUploading(false);
    }
  };

  /* -------------------------
     UPLOAD PDF
  --------------------------*/
  const handlePdfUpload = async () => {
    if (!pdfFile) return;

    try {
      setPdfUploading(true);

      const formData = new FormData();
      formData.append("pdf", pdfFile);

      await apiUpload.post(`/api/admin/books/${book_id}/pdf`, formData);

      message.success("PDF uploaded");
      setPdfFile(null);
      fetchBook();
    } catch (error) {
      console.error(error);
      message.error("PDF upload failed");
    } finally {
      setPdfUploading(false);
    }
  };

  if (!book) return null;

  return (
    <div style={{ padding: 16 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <Title level={3}>Edit Book</Title>

      <Row gutter={24}>
        {/* LEFT */}
        <Col xs={24} lg={14}>
          <Card title="Book Information" loading={loading}>
            <Form form={form} layout="vertical">
              <Form.Item label="Title" name="title">
                <Input />
              </Form.Item>

              <Form.Item label="Author" name="author">
                <Input />
              </Form.Item>

              <Form.Item label="Price" name="price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Discount" name="discount">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Published Year" name="published_year">
                <Select>
                  {years.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                label="In Stock"
                name="in_stock"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Hide From Student List"
                name="hide_from_list"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Button type="primary" onClick={handleTextUpdate}>
                Update Book Info
              </Button>
            </Form>
          </Card>
        </Col>

        {/* RIGHT */}
        <Col xs={24} lg={10}>
          <Card title="Update Thumbnail" style={{ marginBottom: 16 }}>
            <Text type="secondary">JPG/PNG only. Max size 2 MB.</Text>

            <Upload
              listType="picture-card"
              accept=".jpg,.jpeg,.png"
              beforeUpload={beforeThumbnailUpload}
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Select Image</div>
              </div>
            </Upload>

            <Button
              type="primary"
              disabled={!thumbnailFile || thumbUploading}
              loading={thumbUploading}
              onClick={handleThumbnailUpload}
              style={{ marginTop: 10 }}
            >
              Upload Thumbnail
            </Button>
          </Card>

          <Card title="Update Book PDF">
            <Text type="secondary">PDF only. Max size 5 MB.</Text>

            <br />
            <Upload accept=".pdf" beforeUpload={beforePdfUpload} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select PDF File</Button>
            </Upload>

            <Button
              type="primary"
              disabled={!pdfFile || pdfUploading}
              loading={pdfUploading}
              onClick={handlePdfUpload}
              style={{ marginTop: 10 }}
            >
              Upload PDF
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminEditBook;
