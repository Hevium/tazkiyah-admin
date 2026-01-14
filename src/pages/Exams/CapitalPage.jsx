import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  DatePicker,
} from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { apiGet, apiPost } from "../../api/apiInstances";

const { Option } = Select;

const CapitalPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");

  const [paymentType, setPaymentType] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCapitals = async () => {
    setLoading(true);
    try {
      const res = await apiGet.get("/api/admin/capitals", {
        params: {
          page,
          limit,
          search,
          payment_type: paymentType,
        },
      });

      setData(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapitals();
  }, [page, limit, search, paymentType]);

  const handleCreate = async (values) => {
    try {
      await apiPost.post("/api/admin/capitals", values);
      form.resetFields();
      setIsModalOpen(false);
      fetchCapitals();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Tnx ID",
      dataIndex: "tnx_id",
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Type",
      dataIndex: "payment_type",
      render: (type) =>
        type === "investment" ? "Investment" : "Expense",
    },
    {
      title: "Note",
      dataIndex: "note",
    },
    {
      title: "Date",
      dataIndex: "tnx_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{marginBottom: 16}}>Capital Management</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search by note"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={() => {
            setPage(1);
            setSearch(searchText);
          }}
          onClear={() => {
            setPage(1);
            setSearch("");
            setSearchText("");
          }}
          style={{ width: 220 }}
        />

        <Select
          placeholder="Filter by type"
          allowClear
          value={paymentType || undefined}
          onChange={(value) => {
            setPage(1);
            setPaymentType(value || "");
          }}
          style={{ width: 180 }}
        >
          <Option value="investment">Investment</Option>
          <Option value="expense">Expense</Option>
        </Select>

        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Add Capital
        </Button>
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
      />

      <Modal
        title="Create Capital"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tnx_date: dayjs(),
          }}
          onFinish={(values) => {
            handleCreate({
              ...values,
              tnx_date: values.tnx_date.toISOString(),
            });
          }}
        >
          <Form.Item
            name="tnx_date"
            label="Transaction Date"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="payment_type"
            label="Payment Type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select type">
              <Option value="investment">Investment</Option>
              <Option value="expense">Expense</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="note"
            label="Note"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CapitalPage;
