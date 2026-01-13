import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Typography, Select, Space } from "antd";
import { apiGet } from "../../api/apiInstances";

const { Title } = Typography;
const { Option } = Select;

const pageSizeOptions = [20, 50, 100];

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

      const res = await apiGet.get(
        `/api/exams/leaderboard/${examId}`,
        {
          params: { page, limit },
        }
      );

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
    },
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Total Q",
      dataIndex: "total_question",
      key: "total_question",
      align: "center",
    },
    {
      title: "Correct",
      dataIndex: "correct",
      key: "correct",
      align: "center",
    },
    {
      title: "Incorrect",
      dataIndex: "incorrect",
      key: "incorrect",
      align: "center",
    },
    {
      title: "Skipped",
      dataIndex: "skipped",
      key: "skipped",
      align: "center",
    },
    {
      title: "Negative Marks",
      dataIndex: "negative_mark",
      key: "negative_mark",
      align: "center",
    },
    {
      title: "Obtained Marks",
      dataIndex: "total_obtained_mark",
      key: "total_obtained_mark",
      align: "center",
    },
    {
      title: "Time",
      dataIndex: "time_for_submission_sec",
      key: "time_for_submission_sec",
      align: "center",
      render: (value) => formatTime(value),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Space
        style={{ width: "100%", marginBottom: 16 }}
        align="center"
        justify="space-between"
      >
        <Title level={4} style={{ margin: 0 }}>
          Exam Leaderboard
        </Title>

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
      </Space>

      <Table
        rowKey="student_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default ExamLeaderboard;
