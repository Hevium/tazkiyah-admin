import { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Select, message, Card } from "antd";
import { apiGet, apiPost, apiPut } from "../../api/apiInstances";
import Title from "antd/es/typography/Title";

const { Option } = Select;

const EntryRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState();
  const [referenceType, setReferenceType] = useState();

  /* ================= FETCH DATA ================= */
  const fetchEntryRequests = async () => {
    setLoading(true);
    try {
      const res = await apiGet.get("/api/admin/entry-requests", {
        params: {
          page,
          limit,
          status,
          reference_type: referenceType,
        },
      });

      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch {
      message.error("Failed to load entry requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntryRequests();
  }, [page, limit, status, referenceType]);


  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status, record) => {
    try {
      const payload = {
        amount: Math.abs(record?.amount),
        payment_type: "revenue",
        transaction_from: "exam",
        reference: record?.request_id,
      };


      await apiPost.post("/api/admin/transactions", payload);

      message.success("Payment added successfully");

      await apiPut.put(`/api/admin/entry-requests/${id}`, { status });
      message.success(`Request ${status}`);
      fetchEntryRequests();
    } catch (error) {
      console.log(error)
      message.error("Failed to update status");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "Request ID",
      dataIndex: "request_id",
      key: "request_id",
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Phone",
      dataIndex: "student_phone",
      key: "student_phone",
    },
    {
      title: "Reference",
      render: (_, record) => (
        <>
          <div>{record.reference_title}</div>
          <Tag className="text_capitalized">{record.reference_type}</Tag>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => (amount === 0 ? "Free" : `৳${amount}`),
    },
    {
      title: "Payment",
      render: (_, record) =>
        record.entry_type === "paid" ? (
          <>
            <div>{record.payment_method}</div>
            <small>From: {record.sender_number}</small>
          </>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";
        return (
          <Tag color={color} className="text_capitalized">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Transaction Received",
      dataIndex: "transaction_amount_sum",
      render: (amount) => amount > 0 ? amount : "N/A"
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          {record.status == "pending" ? (
            <>
              <Button
                type="primary"
                size="small"
                disabled={record.status === "approved"}
                onClick={() => updateStatus(record._id, "approved", record)}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                disabled={record.status === "rejected"}
                onClick={() => updateStatus(record._id, "rejected", record)}
              >
                Reject
              </Button>
            </>
          ) : (
            "N/A"
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Page Title */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Request Management
      </Title>
      {/* ================= FILTERS ================= */}
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
        </Select>

        <Select
          placeholder="Reference Type"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => {
            setPage(1);
            setReferenceType(value);
          }}
        >
          <Option value="exam">Exam</Option>
          <Option value="book">Book</Option>
        </Select>
      </Space>

      {/* ================= TABLE ================= */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
      />
    </div>
  );
};

export default EntryRequests;
