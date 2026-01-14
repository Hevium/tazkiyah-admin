import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Result,
  Button,
  Typography,
  Space,
  Divider,
} from "antd";
import { apiGet } from "../../api/apiInstances";

const { Title, Text, Paragraph } = Typography;

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await apiGet.get(`/api/exams/result/${attemptId}`);
        setData(res.data);
      } catch {
        setData({ error: true });
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  if (loading) {
    return <Spin fullscreen />;
  }

  /* ============================
     RESULT NOT PUBLISHED
  ============================ */
  if (data?.result_status === "hidden") {
    return (
      <Card style={{ maxWidth: 700, margin: "80px auto" }}>
        <Result
          status="info"
          title="Result Not Published Yet"
          subTitle="This exam result has not been published yet. Once published, you will be able to see your marks and detailed result here."
          extra={
            <Button type="primary" onClick={() => navigate("/exam/enroll")}>
              Back to Exams
            </Button>
          }
        />
      </Card>
    );
  }

  /* ============================
     RESULT PUBLISHED
  ============================ */
  if (data?.result_status === "published") {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto" }}>
        {/* Summary */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={3}>Exam Result</Title>

          <Space size="large" dire>
            <Text strong>
              Marks: {data.obtained_marks} / {data.total_marks}
            </Text>
            {data?.leaderboard_status == "published" ? (
              <Text strong>Merit Position: {data?.merit_position}</Text>
            ) : <Text style={{color: "green"}}>Merit List not published yet.</Text>}
          </Space>
        </Card>

        {/* Questions */}
        {data.questions.map((q, index) => (
          <Card key={q.question_id} style={{ marginBottom: 20 }}>
            <Title level={5}>
              Q{index + 1}.{" "}
              <span style={{ fontSize: 20 }} className="kalpurush_font">
                {q.title}
              </span>
            </Title>

            <Space direction="vertical" style={{ width: "100%" }}>
              {Object.entries(q.options).map(([key, value]) => {
                const isCorrect = key === q.correct;
                const isSelected = key === q.selected;

                let bg = "#fff";
                let border = "#e5e7eb";

                if (isCorrect) {
                  bg = "#f6ffed";
                  border = "#52c41a";
                } else if (isSelected && !isCorrect) {
                  bg = "#fff1f0";
                  border = "#ff4d4f";
                }

                return (
                  <div
                    key={key}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: bg,
                    }}
                  >
                    <strong>{key.toUpperCase()}.</strong>{" "}
                    <span className="kalpurush_font">{value}</span>
                  </div>
                );
              })}
            </Space>

            {/* Explanation */}
            <Divider />
            <Paragraph>
              <strong>Explanation:</strong>
            </Paragraph>
            <div
              className="kalpurush_font"
              dangerouslySetInnerHTML={{
                __html: q.explanation,
              }}
            />
          </Card>
        ))}

        <Divider />

        <Button type="primary" onClick={() => navigate("/exam/enroll")}>
          Back to Exams
        </Button>
      </div>
    );
  }

  /* ============================
     FALLBACK
  ============================ */
  return (
    <Result
      status="error"
      title="Something went wrong. Please try again later."
    />
  );
};

export default ExamResult;
