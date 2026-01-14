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
import { EditOutlined } from "@ant-design/icons";
import EditStudentModal from "../../components/EditStudentModal";
import { apiGet } from "../../api/apiInstances";

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const StudentsList = () => {
  // ================== States ==================
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ================== Fetch Students ==================
  const fetchStudents = async (
    page = 1,
    limit = 15,
    searchText = "",
    statusValue = "all"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGet.get("/api/students", {
        params: {
          page,
          limit,
          search: searchText,
          status: statusValue,
        },
      });

      // update table data & pagination
      setStudents(res.data.data);
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit,
        total: res.data.pagination.total,
      });
    } catch (err) {
      // handle fetch error
      setError(
        err?.response?.data?.message ||
          "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchStudents();
  }, []);

  // ================== Edit Handler ==================
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditOpen(true);
  };

  // ================== Table Columns ==================
  const columns = [
    { title: "ID", dataIndex: "student_id", responsive: ["sm"] },
    { title: "Name", dataIndex: "full_name" },
    { title: "Phone", dataIndex: "phone", responsive: ["md"] },
    { title: "Email", dataIndex: "email", responsive: ["md"] },
    { title: "Address", dataIndex: "address", responsive: ["lg"] },
    {
      title: "Status",
      dataIndex: "account_status",
      render: (s) =>
        s === "active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Blocked</Tag>
        ),
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Edit Student">
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
    <div style={{ padding: 16 }}>
      {/* Page Title */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Student Management
      </Title>

      {/* Search & Filter */}
      <Space
        style={{ marginBottom: 16, width: "100%" }}
        direction={isMobile ? "vertical" : "horizontal"}
        wrap
      >
        <Search
          placeholder="Search name, email, ID"
          allowClear
          style={{ width: isMobile ? "100%" : 280 }}
          onSearch={(v) => {
            setSearch(v);
            fetchStudents(1, 15, v, status);
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
            fetchStudents(1, 15, search, newStatus);
          }}
        >
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="blocked">Blocked</Select.Option>
        </Select>
      </Space>

      {/* Error Message */}
      {error && (
        <Alert title="Error" description={error} type="error" showIcon />
      )}

      {/* Students Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={students}
          pagination={pagination}
          scroll={{ x: "max-content" }}
          expandable={
            isMobile
              ? {
                  expandedRowRender: (record) => (
                    <div>
                      <div>
                        <strong>ID:</strong> {record.student_id || "—"}
                      </div>
                      <div>
                        <strong>Phone:</strong> {record.phone || "—"}
                      </div>
                      <div>
                        <strong>Email:</strong> {record.email || "—"}
                      </div>
                      <div>
                        <strong>Address:</strong> {record.address || "—"}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        {record.account_status === "active" ? (
                          <Tag color="green">Active</Tag>
                        ) : (
                          <Tag color="red">Blocked</Tag>
                        )}
                      </div>
                    </div>
                  ),
                  rowExpandable: () => true,
                }
              : undefined
          }
          onChange={(p) => fetchStudents(p.current, p.pageSize, search, status)}
        />
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        open={editOpen}
        student={selectedStudent}
        onClose={() => setEditOpen(false)}
        onUpdated={() =>
          fetchStudents(pagination.current, pagination.pageSize, search, status)
        }
      />
    </div>
  );
};

export default StudentsList;
