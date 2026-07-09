import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import "../assets/fonts/kalpurush-normal";

const PAGE_SIZE = 25;

const COMPANY_NAME = "AT-TAZKIYAH";
const SHEET_NAME = "EXAM RESULT MERIT LIST";

const formatTime = (seconds = 0) => {
  const totalSeconds = Math.round(seconds);

  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  if (min === 0) return `${sec} sec`;

  return `${min} min ${sec} sec`;
};

const splitIntoPages = (students = []) => {
  const pages = [];

  for (let i = 0; i < students.length; i += PAGE_SIZE) {
    pages.push(students.slice(i, i + PAGE_SIZE));
  }

  return pages;
};

const buildTableBody = (students = []) => {
  return students.map((student) => [
    student.merit_position,
    student.student_name,
    student.student_id,
    student.total_question,
    student.correct,
    student.incorrect,
    student.skipped,
    student.negative_mark,
    student.total_obtained_mark,
    formatTime(student.time_for_submission_sec),
  ]);
};

const drawHeader = ({
  doc,
  totalStudents,
  currentPage,
  totalPages,
}) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text(COMPANY_NAME, 105, 15, {
    align: "center",
  });

  doc.setFontSize(13);

  doc.text(SHEET_NAME, 105, 23, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Print On : ${moment().format("DD MMM YYYY hh:mm A")}`,
    14,
    34
  );

  doc.text(
    `Total Students : ${totalStudents}`,
    105,
    34,
    {
      align: "center",
    }
  );

  doc.text(
    `Page ${currentPage} of ${totalPages}`,
    196,
    34,
    {
      align: "right",
    }
  );

  doc.setDrawColor(180);
  doc.setLineWidth(0.4);
  doc.line(14, 38, 196, 38);
};

const drawFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(180);
  doc.setLineWidth(0.4);
  doc.line(14, pageHeight - 12, 196, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("www.attazkiyah.org", 105, pageHeight - 6, {
    align: "center",
  });
};

const getTableConfig = (body) => ({
  startY: 42,

  head: [
    [
      "Merit",
      "Student Name",
      "Student ID",
      "Total Q",
      "Correct",
      "Incorrect",
      "Skipped",
      "Negative",
      "Marks",
      "Time",
    ],
  ],

  body,

  theme: "grid",

  styles: {
    font: "helvetica",
    fontSize: 8,
    textColor: [0, 0, 0],
    cellPadding: 2.5,
    lineColor: [170, 170, 170],
    lineWidth: 0.2,
    valign: "middle",
    halign: "center",
    overflow: "linebreak",
  },

  headStyles: {
    fillColor: [235, 235, 235],
    textColor: [0, 0, 0],
    fontStyle: "bold",
    halign: "center",
    valign: "middle",
  },

  columnStyles: {
    0: { cellWidth: 12 },

    1: {
      cellWidth: 42,
      halign: "left",
    },

    2: { cellWidth: 24 },
    3: { cellWidth: 12 },
    4: { cellWidth: 13 },
    5: { cellWidth: 15 },
    6: { cellWidth: 14 },
    7: { cellWidth: 16 },
    8: { cellWidth: 15 },
    9: { cellWidth: 22 },
  },

  didParseCell: (hookData) => {
    // Student Name column only
    if (
      hookData.section === "body" &&
      hookData.column.index === 1
    ) {
      hookData.cell.styles.font = "kalpurush";
      hookData.cell.styles.fontStyle = "normal";
      hookData.cell.styles.halign = "left";
    }
  },
});

const downloadLeaderboardPDF = ({
  data = [],
}) => {
  if (!data.length) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pages = splitIntoPages(data);
  const totalPages = pages.length;

  pages.forEach((pageData, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
    }

    drawHeader({
      doc,
      totalStudents: data.length,
      currentPage: pageIndex + 1,
      totalPages,
    });

    autoTable(doc, getTableConfig(buildTableBody(pageData)));

    drawFooter(doc);
  });

  doc.save(
    `exam-merit-list-${moment().format(
      "YYYYMMDD-HHmmss"
    )}.pdf`
  );
};

export default downloadLeaderboardPDF;