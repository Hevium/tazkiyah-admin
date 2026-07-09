import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  Typography,
  Select,
  Space,
  Button,
  Row,
  Col,
} from "antd";
import { apiGet } from "../../api/apiInstances";
import { EyeOutlined } from "@ant-design/icons";
import DownloadLeaderboardPDF from "../../components/DownloadLeaderboardPDF";

const { Title } = Typography;
const { Option } = Select;

const pageSizeOptions = [20, 50, 100, 5000];

/* Time formatter: seconds → X min Y sec */
const formatTime = (seconds = 0) => {
  const totalSeconds = Math.round(seconds);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  if (min === 0) return `${sec} sec`;
  return `${min} min ${sec} sec`;
};

const ExamLeaderboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!examId) return;
    fetchLeaderboard();
  }, [examId, page, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const res = await apiGet.get(`/api/exams/leaderboard/${examId}`, {
        params: { page, limit },
      });

      if (res.data?.success) {
        setData(res.data.data);
        setTotal(res.data.pagination.total_students);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Merit",
      dataIndex: "merit_position",
      key: "merit_position",
      width: 80,
      align: "center",
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
      width: 220,
    },
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
      width: 150,
    },
    {
      title: "Total Q",
      dataIndex: "total_question",
      key: "total_question",
      align: "center",
      width: 90,
    },
    {
      title: "Correct",
      dataIndex: "correct",
      key: "correct",
      align: "center",
      width: 90,
    },
    {
      title: "Incorrect",
      dataIndex: "incorrect",
      key: "incorrect",
      align: "center",
      width: 100,
    },
    {
      title: "Skipped",
      dataIndex: "skipped",
      key: "skipped",
      align: "center",
      width: 90,
    },
    {
      title: "Negative Marks",
      dataIndex: "negative_mark",
      key: "negative_mark",
      align: "center",
      width: 130,
    },
    {
      title: "Obtained Marks",
      dataIndex: "total_obtained_mark",
      key: "total_obtained_mark",
      align: "center",
      width: 140,
    },
    {
      title: "Time",
      dataIndex: "time_for_submission_sec",
      key: "time_for_submission_sec",
      align: "center",
      width: 120,
      render: (value) => formatTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/admin/exams/submittion/${record._id}`)}
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
      <Row
        gutter={[16, 16]}
        justify="space-between"
        align="middle"
        style={{ marginBottom: 16 }}
      >
        <Col xs={24} md={8}>
          <Title level={4} style={{ margin: 0 }}>
            Exam Leaderboard
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
            <Space>
              <span>Per page</span>

              <Select
                value={limit}
                style={{ width: 100 }}
                onChange={(value) => {
                  setPage(1);
                  setLimit(value);
                }}
              >
                {pageSizeOptions.map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
            </Space>

            <DownloadLeaderboardPDF
              title="Exam Result Merit List"
              data={data}
            />
          </div>
        </Col>
      </Row>

      <Table
        rowKey="student_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        scroll={{ x: 1300 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
      />
    </div>
  );
};

export default ExamLeaderboard;