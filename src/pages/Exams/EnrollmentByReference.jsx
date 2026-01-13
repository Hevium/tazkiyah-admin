import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Input,
  Row,
  Col,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/apiInstances";

const { Title } = Typography;

const EnrollmentByReference = () => {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState("");

  const fetchData = async (searchValue = searchText) => {
    setLoading(true);
    try {
      const res = await apiGet.get(
        `/api/exams/enrollment/by-reference/${id}`,
        {
          params: {
            page,
            limit,
            search_text: searchValue || undefined,
          },
        }
      );

      setData(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /*  Debounced search (typing) */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  /* Pagination / reference change */
  useEffect(() => {
    fetchData();
  }, [page, limit, id]);

  const columns = [
    {
      title: "Student",
      dataIndex: "student_name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Student ID",
      dataIndex: "student_id",
    },
    {
      title: "Phone",
      dataIndex: "student_phone",
    },
    {
      title: "Address",
      dataIndex: "student_address",
    },
    {
      title: "Entry Type",
      dataIndex: "entry_type",
      render: (type) =>
        type === "paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="blue">Free</Tag>
        ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => `৳ ${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const colors = {
          approved: "green",
          pending: "orange",
          rejected: "red",
        };
        return (
          <Tag color={colors[status]} className="text_capitalized">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Enrollment Date",
      dataIndex: "createdAt",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB"),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ marginBottom: 20 }}>
        Enrollment List (Reference ID: {id})
      </Title>

      {/* Search */}
      <Row style={{ marginBottom: 20 }}>
        <Col xs={24} md={10}>
          <Input.Search
            placeholder="Search by name, phone or student ID"
            prefix={<SearchOutlined />}
            allowClear
            enterButton
            onSearch={(value) => {
              setPage(1);
              setSearchText(value);
              fetchData(value);
            }}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />
        </Col>
      </Row>

      {/* Table */}
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
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
      />
    </div>
  );
};

export default EnrollmentByReference;
