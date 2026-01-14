import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Input,
  Row,
  Col,
  Card,
  Button,
} from "antd";
import dayjs from "dayjs";
import { apiGet } from "../../api/apiInstances";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();


  const fetchOrders = async (
    page = 1,
    pageSize = 10,
    search = ""
  ) => {
    setLoading(true);
    try {
      const res = await apiGet.get("/api/admin/orders", {
        params: {
          page,
          limit: pageSize,
          search_text: search || undefined,
        },
      });

      setOrders(res.data.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.pagination.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(
      pagination.current,
      pagination.pageSize,
      searchText
    );
    // eslint-disable-next-line
  }, []);

  /* ---------- TABLE COLUMNS ---------- */
  const columns = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 140,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <>
          <div>{record.customer.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.customer.phone}
          </div>
        </>
      ),
    },
    {
      title: "Address",
      dataIndex: ["customer", "address"],
      key: "address",
      ellipsis: true,
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => {
        let color = "blue";
        if (status === "pending") color = "orange";
        if (status === "processing") color = "cyan";
        if (status === "in_transit") color = "purple";
        if (status === "delivered") color = "green";
        if (status === "cancelled") color = "red";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Total",
      dataIndex: ["pricing", "grand_total"],
      key: "total",
      render: (amount) => `৳${amount}`,
    },
    {
  title: "Action",
  key: "action",
  align: "center",
  render: (_, record) => (
    <Button
      type="link"
      icon={<EyeOutlined />}
      onClick={() => navigate(`/admin/orders/${record?.order_id}`)}
    />
  ),
},

  ];

  /* ---------- TABLE CHANGE ---------- */
  const handleTableChange = (pag) => {
    fetchOrders(
      pag.current,
      pag.pageSize,
      searchText
    );
  };

  /* ---------- SEARCH ---------- */
  const handleSearch = (value) => {
    setSearchText(value);
    fetchOrders(1, pagination.pageSize, value);
  };

  return (
    <div style={{padding: 16}}>
      <Title level={3}>All Orders</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Search by order id, name, phone, address"
              allowClear
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default AdminOrders;
