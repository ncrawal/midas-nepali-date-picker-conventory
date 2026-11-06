import React, { useState } from "react";
import { Card, Table, Tag, Space, Button, Statistic, Row, Col, Badge } from "antd";
import { NewNepaliRangePicker } from "midas-nepali-date-picker-conventory/picker";
import { NepaliDate, daysBetween } from "midas-nepali-date-picker-conventory";
import type { NepaliRangeChangeExtra } from "midas-nepali-date-picker-conventory/picker";

interface BillingRecord {
  key: string;
  invoiceNo: string;
  patient: string;
  dateBs: string;
  dateAd: string;
  amount: number;
  status: "Paid" | "Pending";
}

const SAMPLE_RECORDS: BillingRecord[] = [
  { key: "1", invoiceNo: "INV-2081-001", patient: "Sita Sharma", dateBs: "2081-10-01", dateAd: "2025-01-14", amount: 12500, status: "Paid" },
  { key: "2", invoiceNo: "INV-2081-002", patient: "Hari Prasad Giri", dateBs: "2081-10-08", dateAd: "2025-01-21", amount: 4800, status: "Paid" },
  { key: "3", invoiceNo: "INV-2081-003", patient: "Gita Devi Karki", dateBs: "2081-10-15", dateAd: "2025-01-28", amount: 23000, status: "Pending" },
  { key: "4", invoiceNo: "INV-2081-004", patient: "Biraj Shrestha", dateBs: "2081-10-22", dateAd: "2025-02-04", amount: 9200, status: "Paid" },
  { key: "5", invoiceNo: "INV-2081-005", patient: "Pooja Gurung", dateBs: "2081-11-02", dateAd: "2025-02-14", amount: 15400, status: "Paid" },
];

export const Demo2RangePicker: React.FC = () => {
  const [rangeBs, setRangeBs] = useState<[string, string]>(["2081-10-01", "2081-10-30"]);
  const [filteredData, setFilteredData] = useState<BillingRecord[]>(SAMPLE_RECORDS);

  const handleRangeChange = (dates: any, extra: NepaliRangeChangeExtra) => {
    if (extra?.bsStrings && extra.bsStrings[0] && extra.bsStrings[1]) {
      const start = extra.bsStrings[0];
      const end = extra.bsStrings[1];
      setRangeBs([start, end]);
      setFilteredData(
        SAMPLE_RECORDS.filter((r) => r.dateBs >= start && r.dateBs <= end)
      );
    } else {
      setFilteredData(SAMPLE_RECORDS);
    }
  };

  const dayCount = rangeBs[0] && rangeBs[1] ? Math.max(0, daysBetween(rangeBs[0], rangeBs[1]) + 1) : 0;
  const totalRevenue = filteredData.reduce((acc, cur) => acc + (cur.status === "Paid" ? cur.amount : 0), 0);

  const columns = [
    { title: "Invoice #", dataIndex: "invoiceNo", key: "invoiceNo" },
    { title: "Patient Name", dataIndex: "patient", key: "patient" },
    {
      title: "Nepali Date (BS)",
      dataIndex: "dateBs",
      key: "dateBs",
      render: (bs: string) => <Tag color="blue">{bs}</Tag>,
    },
    {
      title: "Gregorian Date (AD)",
      dataIndex: "dateAd",
      key: "dateAd",
      render: (ad: string) => <Tag color="cyan">{ad}</Tag>,
    },
    {
      title: "Amount (NPR)",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `Rs. ${val.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: "Paid" | "Pending") => (
        <Badge status={st === "Paid" ? "success" : "warning"} text={st} />
      ),
    },
  ];

  return (
    <Card
      title="Project 2: Hospital Financial & Billing Report (Range Filter)"
      extra={<Tag color="green">npm: NewNepaliRangePicker</Tag>}
      style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <p style={{ color: "#555" }}>
        Demonstrates the <strong>NewNepaliRangePicker</strong> for querying records within a Nepali Bikram Sambat date window.
      </p>

      <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Filter Invoices by Nepali Date Range:
          </label>
          <NewNepaliRangePicker
            enableDualCalendar={true}
            defaultValue={[new NepaliDate(2081, 9, 1), new NepaliDate(2081, 9, 30)]}
            onChange={handleRangeChange}
            style={{ minWidth: 360 }}
          />
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Selected Range (Days)" value={dayCount} suffix="days" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Invoices Found" value={filteredData.length} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Total Paid Revenue"
                value={totalRevenue}
                prefix="NPR "
                precision={2}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
        </Row>
      </Space>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={false}
        size="small"
      />
    </Card>
  );
};
