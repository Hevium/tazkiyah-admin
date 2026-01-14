import {
  Card,
  List,
  Row,
  Col,
  Tag,
  Typography,
  Spin,
  Empty,
  message,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiGet } from "../api/apiInstances";

const { Text } = Typography;

const OrderTransaction = ({ reference }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) return;

    const fetchTransactions = async () => {
      try {
        const res = await apiGet.get(
          `/api/admin/transactions/reference?reference=${reference}&transaction_from=order`
        );

        setTransactions(res.data.data || []);
      } catch {
        message.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [reference]);

  return (
    <Card title="Transaction History" style={{ marginBottom: 24 }}>
      {loading ? (
        <Row justify="center" style={{ padding: 24 }}>
          <Spin />
        </Row>
      ) : transactions.length === 0 ? (
        <Empty description="No transactions found" />
      ) : (
        <List
          dataSource={transactions}
          itemLayout="horizontal"
          renderItem={(item) => (
            <List.Item>
              <Row style={{ width: "100%" }} align="middle">
                {/* LEFT */}
                <Col span={12}>
                  <Text strong>
                    {dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </Text>
                  <br />
                  <Text type="secondary">Ref: {item.reference}</Text>
                </Col>

                {/* CENTER */}
                <Col span={6}>
                  <Tag
                    color={item.payment_type === "revenue" ? "green" : "red"}
                  >
                    {item.payment_type.toUpperCase()}
                  </Tag>
                </Col>

                {/* RIGHT */}
                <Col span={6} style={{ textAlign: "right" }}>
                  <Text
                    strong
                    style={{
                      color:
                        item.payment_type === "revenue" ? "#389e0d" : "#cf1322",
                      fontSize: 16,
                    }}
                  >
                    {item.payment_type === "loss" ? "-" : "+"}৳{item.amount}
                  </Text>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default OrderTransaction;
