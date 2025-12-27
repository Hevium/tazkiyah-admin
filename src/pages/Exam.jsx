import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Space,
  Tag,
  Button,
  Tooltip,
  Alert,
  Typography,
  Grid,
} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiGet } from "../api/apiInstances";
// import EditExamModal from "../../components/EditExamModal"; // Optional (যদি থাকে)

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const Exam = () => {
  // ================== Responsive ==================
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // ================== States ==================
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [accessType, setAccessType] = useState("all");

  // Optional modal states
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // ================== Helpers ==================
  const renderStatus = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "published") return <Tag color="green">Published</Tag>;
    if (v === "draft") return <Tag color="orange">Draft</Tag>;
    if (v === "closed") return <Tag color="red">Closed</Tag>;
    return <Tag>Unknown</Tag>;
  };

  const renderAccess = (record) => {
    const a = String(record?.access_type || "").toLowerCase();
    if (a === "paid") return <Tag color="geekblue">Paid ৳{record?.price ?? 0}</Tag>;
    if (a === "free") return <Tag color="purple">Free</Tag>;
    return <Tag>—</Tag>;
  };

  // ================== Fetch Exams ==================
  const fetchExams = async (
    page = 1,
    limit = pagination.pageSize,
    searchText = search,
    statusValue = status,
    accessValue = accessType
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGet.get("/api/exams", {
        params: {
          page,
          limit,
          search: searchText,
          status: statusValue, // all | draft | published | closed
          access_type: accessValue, // all | free | paid
        },
      });

      const data = res?.data?.data || [];
      const pg = res?.data?.pagination || {};

      // ✅ Support multiple possible pagination formats (backend may vary)
      const current =
        pg.current_page ?? pg.page ?? pg.current ?? page;
      const pageSize =
        pg.per_page ?? pg.limit ?? pg.pageSize ?? limit;
      const total =
        pg.total_records ?? pg.total ?? pg.totalRecords ?? 0;

      setExams(data);

      setPagination({
        current: Number(current) || page,
        pageSize: Number(pageSize) || limit,
        total: Number(total) || 0,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load exams. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchExams(1, pagination.pageSize, "", "all", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== Edit Handler ==================
  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setEditOpen(true);
  };

  // ================== Table Columns ==================
  const columns = [
    { title: "Exam ID", dataIndex: "exam_id", responsive: ["md"] },
    { title: "Title", dataIndex: "exam_title" },
    {
      title: "Status",
      dataIndex: "exam_status",
      render: renderStatus,
      width: 120,
    },
    {
      title: "Access",
      render: (_, record) => renderAccess(record),
      width: 140,
      responsive: ["sm"],
    },
    {
      title: "Q",
      dataIndex: "total_question",
      width: 70,
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Duration",
      dataIndex: "duration_minutes",
      width: 110,
      align: "center",
      responsive: ["sm"],
      render: (v) => (v ? `${v} min` : "—"),
    },
    {
      title: "Action",
      align: "center",
      width: 90,
      render: (_, record) => (
        <Tooltip title="Edit Exam">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Page Title */}
      <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            Exam Management
          </Title>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchExams(pagination.current, pagination.pageSize, search, status, accessType)}
        >
          Refresh
        </Button>
      </Space>

      {/* Search & Filter */}
      <Space
        style={{ marginTop: 16, marginBottom: 16, width: "100%" }}
        direction={isMobile ? "vertical" : "horizontal"}
        wrap
      >
        <Search
          placeholder="Search by exam title"
          allowClear
          style={{ width: isMobile ? "100%" : 280 }}
          onSearch={(v) => {
            setSearch(v);
            fetchExams(1, pagination.pageSize, v, status, accessType);
          }}
        />

        <Select
          value={status !== "all" ? status : undefined}
          allowClear
          placeholder="Filter by status"
          style={{ width: isMobile ? "100%" : 180 }}
          onChange={(v) => {
            const newStatus = v || "all";
            setStatus(newStatus);
            fetchExams(1, pagination.pageSize, search, newStatus, accessType);
          }}
        >
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="published">Published</Select.Option>
          <Select.Option value="closed">Closed</Select.Option>
        </Select>

        <Select
          value={accessType !== "all" ? accessType : undefined}
          allowClear
          placeholder="Filter by access"
          style={{ width: isMobile ? "100%" : 180 }}
          onChange={(v) => {
            const newAccess = v || "all";
            setAccessType(newAccess);
            fetchExams(1, pagination.pageSize, search, status, newAccess);
          }}
        >
          <Select.Option value="free">Free</Select.Option>
          <Select.Option value="paid">Paid</Select.Option>
        </Select>
      </Space>

      {/* Error Message */}
      {error && (
        <Alert title="Error" description={error} type="error" showIcon />
      )}

      {/* Exams Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          rowKey={(r) => r?._id || r?.exam_id}
          loading={loading}
          columns={columns}
          dataSource={exams}
          pagination={pagination}
          scroll={{ x: "max-content" }}
          onChange={(p) =>
            fetchExams(p.current, p.pageSize, search, status, accessType)
          }
          expandable={
            isMobile
              ? {
                  expandedRowRender: (r) => (
                    <div>
                      <div>
                        <strong>Exam ID:</strong> {r.exam_id || "—"}
                      </div>
                      <div>
                        <strong>Access:</strong> {renderAccess(r)}
                      </div>
                      <div>
                        <strong>Questions:</strong> {r.total_question ?? "—"}
                      </div>
                      <div>
                        <strong>Duration:</strong> {r.duration_minutes ? `${r.duration_minutes} min` : "—"}
                      </div>
                      <div>
                        <strong>Status:</strong> {renderStatus(r.exam_status)}
                      </div>
                    </div>
                  ),
                  rowExpandable: () => true,
                }
              : undefined
          }
        />
      </div>

      {/* Optional: Edit Exam Modal */}
      {/* 
      <EditExamModal
        open={editOpen}
        exam={selectedExam}
        onClose={() => setEditOpen(false)}
        onUpdated={() => fetchExams(pagination.current, pagination.pageSize, search, status, accessType)}
      /> 
      */}
    </div>
  );
};

export default Exam;
