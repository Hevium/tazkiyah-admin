import { useEffect, useState } from "react";
import { Table, Button, Input, Space, Card } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/apiInstances";
import CreateBookModal from "../../components/CreateBookModal";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const fetchBooks = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const res = await apiGet.get("/api/admin/books", {
        params: {
          page,
          limit,
          searchText: search,
        },
      });

      setBooks(res.data.data);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.pagination.total,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleTableChange = (pagination) => {
    fetchBooks(pagination.current, pagination.pageSize, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchBooks(1, pagination.pageSize, value);
  };

  // ✅ modal success হলে list refresh
  const refreshBooks = () => {
    fetchBooks(pagination.current, pagination.pageSize, searchText);
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      render: (img) =>
        img ? <img src={BASE_URL + img} alt="book" style={{ width: 40 }} /> : "N/A",
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Book ID",
      dataIndex: "book_id",
    },
    {
      title: "Author",
      dataIndex: "author",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `৳ ${price}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (discount) => `৳ ${discount}`,
    },
    {
      title: "Current Price",
      render: (render) => `৳ ${render.price - render.discount}`,
    },
    {
      title: "Stock",
      dataIndex: "in_stock",
      render: (val) => (val ? "In Stock" : "Out"),
    },
    {
      title: "Hidden",
      dataIndex: "hide_from_list",
      render: (val) => (val === "yes" ? "Yes" : "No"),
    },
     {
      title: "Action",
      align: "center",
      render: (_, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/books/${record?.book_id}`)}
          />
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="Book List"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Add New Book
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search by book title"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
        </Space>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={books}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* ✅ Create Book Modal */}
      <CreateBookModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refreshBooks}
      />
    </div>
  );
};

export default BookList;
