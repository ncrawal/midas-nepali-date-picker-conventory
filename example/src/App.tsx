import React, { useState } from "react";
import { Tabs, Layout, Typography, Tag, Space, Card, Button } from "antd";
import { Demo1SinglePicker } from "./demos/Demo1SinglePicker";
import { Demo2RangePicker } from "./demos/Demo2RangePicker";
import { Demo3UtilitiesPlayground } from "./demos/Demo3UtilitiesPlayground";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");

  const items = [
    {
      key: "1",
      label: "1. Dual DatePicker & Form",
      children: <Demo1SinglePicker />,
    },
    {
      key: "2",
      label: "2. Date Range Filter & Reports",
      children: <Demo2RangePicker />,
    },
    {
      key: "3",
      label: "3. Date Conversions & Utilities",
      children: <Demo3UtilitiesPlayground />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header
        style={{
          background: "#001529",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Space align="center">
          <span style={{ fontSize: 24, marginRight: 8 }}>🇳🇵</span>
          <Title level={4} style={{ color: "#fff", margin: 0, fontWeight: 600 }}>
            midas-nepali-date-picker-conventory
          </Title>
          <Tag color="green" style={{ marginLeft: 8 }}>
            v1.0.0 (npm verified)
          </Tag>
        </Space>
        <Space orientation="horizontal">
          <Button
            type="primary"
            href="https://www.npmjs.com/package/midas-nepali-date-picker-conventory"
            target="_blank"
          >
            npm Package
          </Button>
          <Button
            href="https://github.com/ncrawal/midas-nepali-date-picker-conventory"
            target="_blank"
            style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", background: "transparent" }}
          >
            GitHub
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <Card style={{ marginBottom: 20, borderRadius: 8 }}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>
            Live Integration Verification
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            This application imports directly from the published npm registry package:
            <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 4, marginLeft: 6, color: "#c41d7f" }}>
              npm i midas-nepali-date-picker-conventory
            </code>
          </Paragraph>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={items}
          style={{ background: "transparent" }}
        />
      </Content>

      <Footer style={{ textAlign: "center", color: "#8c8c8c", background: "transparent" }}>
        Midas Nepali Date Picker &amp; Converter © {new Date().getFullYear()} — Built for HMIS, Hospital &amp; Nepali Enterprise Apps.
      </Footer>
    </Layout>
  );
};

export default App;

