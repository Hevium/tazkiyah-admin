import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Input,
  Select,
  Typography,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiInstances";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Title } = Typography;

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // ================== Fetch Exams ==================
  const fetchExams = async (
    page = 1,
    limit = 15,
    searchText = "",
    statusValue = "all"
  ) => {
    setLoading(true);

    try {
      const res = await apiGet.get("/api/admin/exams", {
        params: {
          page,
          limit,
          search: searchText,
          status: statusValue !== "all" ? statusValue : undefined,
        },
      });

      setExams(res.data.data);

      setPagination({
        current: res.data.meta.page,
        pageSize: res.data.meta.limit,
        total: res.data.meta.total,
      });
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message ||
          "Failed to load exams. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // ================== Table Columns ==================
  const columns = [
    {
      title: "Exam Title",
      dataIndex: "exam_title",
      width: 260,
    },
    {
      title: "Access",
      dataIndex: "access_type",
      width: 100,
      align: "center",
      render: (type) =>
        type === "paid" ? (
          <Tag color="purple">Paid</Tag>
        ) : (
          <Tag color="default">Free</Tag>
        ),
    },
    {
      title: "Exam Fee",
      dataIndex: "price",
      width: 110,
      align: "center",
      render: (price) => (price ? `৳ ${price}` : "৳ 0"),
    },
    {
      title: "Questions",
      dataIndex: "total_question",
      width: 100,
      align: "center",
    },
    {
      title: "Duration",
      dataIndex: "duration_minutes",
      width: 100,
      align: "center",
      render: (v) => `${v} min`,
    },
    {
      title: "Marks",
      dataIndex: "total_marks",
      width: 90,
      align: "center",
    },
    {
      title: "Enrollments",
      dataIndex: "total_marks",
      width: 120,
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "exam_status",
      width: 120,
      align: "center",
      render: (status) => {
        const colorMap = {
          draft: "default",
          published: "green",
          closed: "red",
        };

        return (
          <Tag color={colorMap[status]} className="text_capitalized">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/admin/exams/${record.exam_id}`)}
        >
          <EyeOutlined />
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 16,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {contextHolder}

      {/* Header */}
      <Row
        gutter={[16, 16]}
        justify="space-between"
        align="middle"
        style={{ marginBottom: 16 }}
      >
        <Col xs={24} md={8}>
          <Title level={4} style={{ margin: 0 }}>
            Exam Management
          </Title>
        </Col>

        <Col xs={24} md={16}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Search
              placeholder="Search exam"
              allowClear
              style={{ width: 250, maxWidth: "100%" }}
              onSearch={(value) => {
                setSearch(value);
                fetchExams(1, pagination.pageSize, value, status);
              }}
            />

            <Select
              value={status}
              style={{ width: 160 }}
              onChange={(value) => {
                setStatus(value);
                fetchExams(1, pagination.pageSize, search, value);
              }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="published">Published</Select.Option>
              <Select.Option value="closed">Closed</Select.Option>
            </Select>

            <Button
              type="primary"
              onClick={() => navigate("/admin/exams/create")}
            >
              <PlusOutlined />
              Create Exam
            </Button>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={exams}
        loading={loading}
        bordered
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) =>
            fetchExams(page, pageSize, search, status),
        }}
      />
    </div>
  );
};

export default Exams;