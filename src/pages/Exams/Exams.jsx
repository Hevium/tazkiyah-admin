import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Popconfirm,
  Input,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiInstances";
import { Typography } from "antd";
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
    },
   
    {
      title: "Access",
      dataIndex: "access_type",
      render: (type) =>
        type === "paid" ? <Tag color="purple">Paid</Tag> : <Tag>Free</Tag>,
    },
    {
      title: "Exam Fee",
      dataIndex: "price",
      render: (price) => (price ? `৳ ${price}` : "৳ 0"),
    },
    {
      title: "Total Questions",
      dataIndex: "total_question"
    },
    
    {
      title: "Duration",
      dataIndex: "duration_minutes",
      render: (v) => `${v} min`,
    },
    {
      title: "Marks",
      dataIndex: "total_marks",
    },
    {
      title: "Total Enrollments",
      dataIndex: "total_marks",
    },
     {
      title: "Status",
      dataIndex: "exam_status",
      render: (status) => {
        const colorMap = {
          draft: "default",
          published: "green",
          closed: "red",
        };
        return <Tag color={colorMap[status]} className="text_capitalized">{status}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/admin/exams/${record.exam_id}`)}
          >
            <EyeOutlined />
          </Button>

        </Space>
      ),
    },
  ];

  // ================== Render ==================
  return (
    <div style={{ padding: 16 }}>
      {/* Page Title */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Exam Management
      </Title>

      {contextHolder}
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search exam"
          onSearch={(value) => {
            setSearch(value);
            fetchExams(1, pagination.pageSize, value, status);
          }}
          allowClear
        />

        <Select
          value={status}
          onChange={(value) => {
            setStatus(value);
            fetchExams(1, pagination.pageSize, search, value);
          }}
          style={{ width: 160 }}
        >
          <Select.Option value="all">All Status</Select.Option>
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="published">Published</Select.Option>
          <Select.Option value="closed">Closed</Select.Option>
        </Select>

        <Button type="primary" onClick={() => navigate("/admin/exams/create")}>
          <PlusOutlined /> Create Exam
        </Button>
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={exams}
        loading={loading}
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
