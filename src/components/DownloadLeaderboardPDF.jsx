import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import downloadLeaderboardPDF from "../services/downloadLeaderboardPDF";

const DownloadLeaderboardPDF = ({
  data = [],
  title = "Exam Result Merit List",
}) => {
  const handleDownload = () => {
    if (!data.length) {
      message.warning("No leaderboard data available.");
      return;
    }

    downloadLeaderboardPDF({
      title,
      data,
    });
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={handleDownload}
    >
      Download PDF
    </Button>
  );
};

export default DownloadLeaderboardPDF;