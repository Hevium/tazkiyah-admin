import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Button,
  Tag,
  Typography,
  message,
  Modal,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];

// ✅ Util: build query string
function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    usp.set(k, String(v));
  });
  return usp.toString();
}

export default function StudentsListPage({
  apiBaseUrl = "", // e.g. "https://your-domain.com"
  apiKey,          // x-api-key
  onViewStudent,   // (student) => void
  onEditStudent,   // (student) => void
  pageSizeOptions = [10, 15, 20, 50],
}) {
  const [loading, setLoading] = useState(false);

  // server data
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // UI-only
  const [confirm, setConfirm] = useState({
    open: false,
    record: null,
    nextStatus: null,
  });

  // ✅ columns
  const columns = useMemo(() => {
    return [
      {
        title: "Student ID",
        dataIndex: "student_id",
        key: "student_id",
        width: 160,
        render: (v) => <Text code>{v}</Text>,
      },
      {
        title: "Name",
        dataIndex: "full_name",
        key: "full_name",
        ellipsis: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: true,
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        width: 140,
      },
      {
        title: "Gender",
        dataIndex: "gender",
        key: "gender",
        width: 110,
        render: (v) => (v ? String(v).toUpperCase() : "-"),
      },
      {
        title: "Status",
        dataIndex: "account_status",
        key: "account_status",
        width: 120,
        render: (v) => {
          const s = (v || "").toLowerCase();
          if (s === "active") return <Tag color="green">Active</Tag>;
          if (s === "blocked") return <Tag color="red">Blocked</Tag>;
          return <Tag>Unknown</Tag>;
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_, record) => {
          return (
            <Space>
              <Tooltip title="View">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => onViewStudent?.(record)}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  onClick={() => onEditStudent?.(record)}
                />
              </Tooltip>

              {/* Optional: quick status toggle (UI). If you don't want, remove this block */}
              <Tooltip title="Change Status">
                <Button
                  danger={String(record.account_status).toLowerCase() === "active"}
                  onClick={() => {
                    const current = String(record.account_status || "").toLowerCase();
                    const nextStatus = current === "active" ? "blocked" : "active";
                    setConfirm({ open: true, record, nextStatus });
                  }}
                >
                  {String(record.account_status).toLowerCase() === "active"
                    ? "Block"
                    : "Activate"}
                </Button>
              </Tooltip>
            </Space>
          );
        },
      },
    ];
  }, [onViewStudent, onEditStudent]);

  // ✅ API call
  const fetchStudents = async ({
    page = pagination.current,
    limit = pagination.pageSize,
    searchText = search,
    statusValue = status,
  } = {}) => {
    setLoading(true);
    try {
      const qs = buildQuery({
        page,
        limit,
        search: searchText,
        status: statusValue, // all | active | blocked
      });

      const res = await fetch(`${apiBaseUrl}/api/students?${qs}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
      });

      const json = await res.json().catch(() => null);

      // Unauthorized handling (PDF says: success false + message Unauthorized access)
      if (!res.ok || !json) {
        message.error("Failed to load students.");
        return;
      }

      if (json.success === false) {
        // show server message
        message.error(json.message || "Request failed");
        // optional: if unauthorized, redirect
        if (String(json.message || "").toLowerCase().includes("unauthorized")) {
          // window.location.href = "/login";
        }
        return;
      }

      const data = Array.isArray(json.data) ? json.data : [];
      const pg = json.pagination || {};

      setRows(
        data.map((d, idx) => ({
          key: d.student_id || `${page}-${idx}`,
          ...d,
        }))
      );

      // API returns: current_page, per_page, total_records (and total_pages)
      setPagination({
        current: Number(pg.current_page || page),
        pageSize: Number(pg.per_page || limit),
        total: Number(pg.total_records || 0),
      });
    } catch (e) {
      message.error("Network error while loading students.");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchStudents({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ table change (pagination)
  const handleTableChange = (pager) => {
    fetchStudents({ page: pager.current, limit: pager.pageSize });
  };

  // ✅ search submit
  const handleSearch = (value) => {
    setSearch(value);
    fetchStudents({ page: 1, searchText: value, statusValue: status });
  };

  // ✅ status change
  const handleStatusChange = (value) => {
    setStatus(value);
    fetchStudents({ page: 1, searchText: search, statusValue: value });
  };

  // Optional: quick status update handler (if you actually want to call update endpoint later)
  const confirmStatusChange = async () => {
    const { record, nextStatus } = confirm;
    setConfirm({ open: false, record: null, nextStatus: null });

    // NOTE: Actual update endpoint is PUT /api/students/update
    // Here we only show UI feedback + refetch.
    message.success(`Status will be changed to "${nextStatus}" (hook update API here).`);
    // After updating, refetch current page
    fetchStudents();
  };

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Space
            style={{ width: "100%", justifyContent: "space-between" }}
            align="start"
          >
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Students
              </Title>
              <Text type="secondary">Manage students, search, filter and view details.</Text>
            </div>

            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchStudents({ page: 1 })}
              >
                Refresh
              </Button>
            </Space>
          </Space>

          <div style={{ marginTop: 16 }}>
            <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
              <Input.Search
                placeholder="Search by name, email, student_id"
                allowClear
                style={{ maxWidth: 420, width: "100%" }}
                onSearch={handleSearch}
              />

              <Space>
                <Text type="secondary">Status:</Text>
                <Select
                  value={status}
                  options={STATUS_OPTIONS}
                  style={{ width: 160 }}
                  onChange={handleStatusChange}
                />
              </Space>
            </Space>
          </div>
        </Card>

        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={rows}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: pageSizeOptions.map(String),
              showTotal: (t) => `Total ${t} students`,
            }}
            scroll={{ x: 980 }}
          />
        </Card>
      </Space>

      <Modal
        open={confirm.open}
        title="Confirm status change"
        onCancel={() => setConfirm({ open: false, record: null, nextStatus: null })}
        onOk={confirmStatusChange}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Space align="start">
          <ExclamationCircleOutlined style={{ marginTop: 4 }} />
          <div>
            <div>
              Change status for{" "}
              <Text strong>{confirm.record?.full_name || "this student"}</Text> to{" "}
              <Text strong>{confirm.nextStatus}</Text>?
            </div>
            <Text type="secondary">
              (If you don’t need quick toggle, remove this feature.)
            </Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
