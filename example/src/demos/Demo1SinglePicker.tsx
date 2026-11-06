import React, { useState } from "react";
import { Card, Form, Input, Button, Switch, Alert, Tag, Space, Divider, message } from "antd";
import { NewNepaliDatePicker } from "midas-nepali-date-picker-conventory/picker";
import { NepaliDate, adToBs, bsToAd } from "midas-nepali-date-picker-conventory";
import type { NepaliDateChangeExtra } from "midas-nepali-date-picker-conventory/picker";

export const Demo1SinglePicker: React.FC = () => {
  const [form] = Form.useForm();
  const [dualMode, setDualMode] = useState<boolean>(true);
  const [showDevanagari, setShowDevanagari] = useState<boolean>(false);
  const [selectedBs, setSelectedBs] = useState<string>("2081-10-15");
  const [extraInfo, setExtraInfo] = useState<NepaliDateChangeExtra | null>(null);

  const handleDateChange = (date: any, extra: NepaliDateChangeExtra) => {
    setSelectedBs(extra?.bsString || (date ? date.format("YYYY-MM-DD") : ""));
    setExtraInfo(extra);
  };

  const onFinish = (values: any) => {
    message.success(`Patient registration saved for date: ${selectedBs}`);
    console.log("Form submitted values:", values, "Selected BS:", selectedBs);
  };

  const adDateEquivalent = selectedBs ? bsToAd(selectedBs) : "";
  const nepaliDateObj = selectedBs ? new NepaliDate(selectedBs) : null;

  return (
    <Card
      title="Project 1: Dual BS/AD Patient Registration & Admission"
      extra={<Tag color="blue">npm: midas-nepali-date-picker-conventory/picker</Tag>}
      style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <p style={{ color: "#555" }}>
        Demonstrates the single <strong>NewNepaliDatePicker</strong> with dual BS/AD mode toggle,
        English/Devanagari numerals, and Ant Design Form integration.
      </p>

      <Space style={{ marginBottom: 16 }} wrap>
        <Space>
          <span>Dual BS/AD Toggle:</span>
          <Switch checked={dualMode} onChange={setDualMode} checkedChildren="Dual" unCheckedChildren="Single" />
        </Space>
        <Divider orientation="vertical" />
        <Space>
          <span>Devanagari Numerals:</span>
          <Switch checked={showDevanagari} onChange={setShowDevanagari} checkedChildren="देव" unCheckedChildren="EN" />
        </Space>
      </Space>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ patientName: "Ram Bahadur Thapa", department: "OPD General" }}>
        <Form.Item label="Patient Full Name" name="patientName" rules={[{ required: true }]}>
          <Input placeholder="Enter patient name" style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item label="Department / Ward" name="department" rules={[{ required: true }]}>
          <Input placeholder="Department" style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Admission Date (<strong>Bikram Sambat</strong> / <strong>Gregorian</strong>)
            </span>
          }
          required
        >
          <div style={{ maxWidth: 400 }}>
            <NewNepaliDatePicker
              enableDualCalendar={dualMode}
              showDevanagari={showDevanagari}
              defaultValue={new NepaliDate(2081, 9, 15)}
              onChange={handleDateChange}
              placeholder="Select Nepali or English date"
              style={{ width: "100%" }}
            />
          </div>
        </Form.Item>

        {selectedBs && (
          <Alert
            type="info"
            showIcon
            message="Selected Date Details (Synced across Calendars)"
            description={
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Bikram Sambat (BS):</strong> <Tag color="geekblue">{selectedBs}</Tag>
                  {showDevanagari && nepaliDateObj && (
                    <span> / <strong>देवनागरी:</strong> <Tag color="purple">{nepaliDateObj.format("YYYY MMMM DD, dddd", "np")}</Tag></span>
                  )}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Gregorian (AD):</strong> <Tag color="green">{adDateEquivalent || "N/A"}</Tag>
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Day of Week:</strong> {nepaliDateObj ? nepaliDateObj.format("dddd") : "N/A"}
                </p>
              </div>
            }
            style={{ maxWidth: 500, marginBottom: 16 }}
          />
        )}

        <Button type="primary" htmlType="submit">
          Save Admission Record
        </Button>
      </Form>
    </Card>
  );
};
