import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Spin,
  Divider,
  Space,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiInstances";

const { Title, Text, Paragraph } = Typography;

const BASE_URL = "https://api.attazkiyah.org";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80";

const AdminBookDetails = () => {
  const { book_id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await apiGet.get(`/api/books/${book_id}`);
      setBook(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [book_id]);

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) return null;

  const netPrice = (book.price || 0) - (book.discount || 0);

  return (
    <div style={{ padding: 16 }}>
      {/* HEADER */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/books/${book_id}/edit`)}
        >
          Edit Book
        </Button>
      </Space>

      <Card>
        <Row gutter={32}>
          {/* THUMBNAIL */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              cover={
                <img
                  src={
                    book.thumbnail
                      ? `${BASE_URL}${book.thumbnail}`
                      : DEFAULT_THUMBNAIL
                  }
                  alt={book.title}
                  style={{
                    height: 320,
                    objectFit: "cover",
                  }}
                />
              }
            >
              {/* READ PDF (ONLY IF EXISTS) */}
              {book.pdf_link && (
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  block
                  onClick={() => setPdfOpen(true)}
                >
                  Read PDF
                </Button>
              )}
            </Card>
          </Col>

          {/* BOOK INFO */}
          <Col xs={24} md={16}>
            <Title level={3} style={{ marginBottom: 4 }}>
              {book.title}
            </Title>
            <Text type="secondary">by {book.author}</Text>

            <Divider />

            <Space wrap>
              <Tag color={book.in_stock ? "green" : "red"}>
                {book.in_stock ? "In Stock" : "Out of Stock"}
              </Tag>

              <Tag color={book.hide_from_list === "yes" ? "orange" : "blue"}>
                {book.hide_from_list === "yes"
                  ? "Hidden from Students"
                  : "Visible to Students"}
              </Tag>
            </Space>

            <Divider />

            {/* PRICING */}
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">Price</Text>
                <div>
                  <Text strong>৳ {book.price}</Text>
                </div>
              </Col>

              <Col span={8}>
                <Text type="secondary">Discount</Text>
                <div>
                  <Text strong>৳ {book.discount || 0}</Text>
                </div>
              </Col>

              <Col span={8}>
                <Text type="secondary">Net Price</Text>
                <div>
                  <Text strong style={{ color: "green" }}>
                    ৳ {netPrice}
                  </Text>
                </div>
              </Col>
            </Row>

            <Divider />

            <Text type="secondary">Published Year</Text>
            <div style={{ marginBottom: 12 }}>
              <Text strong>{book.published_year}</Text>
            </div>

            <Paragraph>
              {book.description || "No description provided."}
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* PDF MODAL (ONLY IF PDF EXISTS) */}
      {book.pdf_link && (
        <Modal
          open={pdfOpen}
          onCancel={() => setPdfOpen(false)}
          footer={null}
          width="80%"
          style={{ top: 20 }}
          destroyOnClose
        >
          <iframe
            src={`${BASE_URL}${book.pdf_link}`}
            title="Book PDF"
            style={{
              width: "100%",
              height: "80vh",
              border: "none",
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminBookDetails;
