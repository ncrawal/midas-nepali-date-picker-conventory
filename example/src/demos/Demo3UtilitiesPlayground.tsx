import React, { useState } from "react";
import { Card, Input, Button, Tag, Space, Alert, Typography, Row, Col, message } from "antd";
import {
  NepaliDate,
  adToBs,
  bsToAd,
  getSupportedBsYearRange,
  registerBsYear,
  getTodayBs,
} from "midas-nepali-date-picker-conventory";

const { Text, Title } = Typography;

export const Demo3UtilitiesPlayground: React.FC = () => {
  const [inputAd, setInputAd] = useState<string>("2026-11-06");
  const [convertedBs, setConvertedBs] = useState<string>(() => adToBs("2026-11-06"));

  const [inputBs, setInputBs] = useState<string>("2083-07-21");
  const [convertedAd, setConvertedAd] = useState<string>(() => bsToAd("2083-07-21"));

  const [calendarRange, setCalendarRange] = useState<[number, number]>(() => getSupportedBsYearRange());
  const [extendedYearRegistered, setExtendedYearRegistered] = useState<boolean>(false);

  const handleConvertAdToBs = () => {
    try {
      const bs = adToBs(inputAd);
      setConvertedBs(bs);
      message.success(`Converted ${inputAd} AD -> ${bs} BS`);
    } catch (e: any) {
      message.error(e.message || "Invalid AD date format");
    }
  };

  const handleConvertBsToAd = () => {
    try {
      const ad = bsToAd(inputBs);
      setConvertedAd(ad);
      message.success(`Converted ${inputBs} BS -> ${ad} AD`);
    } catch (e: any) {
      message.error(e.message || "Invalid BS date format");
    }
  };

  const handleRegisterFutureYear = () => {
    try {
      // Register year 2100 with sample month days
      registerBsYear(2100, [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 29, 31]);
      setCalendarRange(getSupportedBsYearRange());
      setExtendedYearRegistered(true);
      message.success("Successfully extended BS calendar up to year 2100 dynamically!");
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const todayBs = getTodayBs();
  const nepaliDateNow = new NepaliDate();

  return (
    <Card
      title="Project 3: Date Utilities, Conversions & Extensible Calendar Playground"
      extra={<Tag color="purple">npm: midas-nepali-date-picker-conventory</Tag>}
      style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <p style={{ color: "#555" }}>
        Direct high-performance functions for algorithmic BS &lt;-&gt; AD conversions, Devanagari numerals,
        and dynamic runtime calendar extension without external heavy libraries.
      </p>

      <Row gutter={[24, 24]}>
        {/* AD to BS */}
        <Col xs={24} md={12}>
          <Card size="small" title="1. Gregorian (AD) -> Bikram Sambat (BS) Converter">
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Enter Gregorian Date (YYYY-MM-DD):</Text>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={inputAd}
                  onChange={(e) => setInputAd(e.target.value)}
                  placeholder="YYYY-MM-DD (e.g. 2026-11-06)"
                />
                <Button orientation="horizontal" type="primary" onClick={handleConvertAdToBs}>
                  Convert
                </Button>
              </Space.Compact>
              {convertedBs && (
                <Alert
                  type="success"
                  message={
                    <span>
                      BS Equivalent: <strong>{convertedBs}</strong>
                    </span>
                  }
                  description={
                    <div>
                      <span>Devanagari Format: </span>
                      <Tag color="magenta">
                        {new NepaliDate(convertedBs).format("YYYY MMMM DD, dddd", "np")}
                      </Tag>
                    </div>
                  }
                  style={{ marginTop: 8 }}
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* BS to AD */}
        <Col xs={24} md={12}>
          <Card size="small" title="2. Bikram Sambat (BS) -> Gregorian (AD) Converter">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">Enter Bikram Sambat Date (YYYY-MM-DD):</Text>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={inputBs}
                  onChange={(e) => setInputBs(e.target.value)}
                  placeholder="YYYY-MM-DD (e.g. 2083-07-21)"
                />
                <Button type="primary" onClick={handleConvertBsToAd}>
                  Convert
                </Button>
              </Space.Compact>
              {convertedAd && (
                <Alert
                  type="info"
                  message={
                    <span>
                      AD Equivalent: <strong>{convertedAd}</strong>
                    </span>
                  }
                  description={`Parsed Day of week: ${new NepaliDate(inputBs).format("dddd")}`}
                  style={{ marginTop: 8 }}
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, padding: 16, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
        <Title level={5} style={{ marginTop: 0 }}>
          3. Dynamic Calendar Range &amp; Extensibility
        </Title>
        <p>
          Currently Supported BS Years in Memory:{" "}
          <Tag color="cyan">{calendarRange[0]} BS</Tag> to <Tag color="cyan">{calendarRange[1]} BS</Tag>
        </p>
        <Space>
          <Button
            type="dashed"
            disabled={extendedYearRegistered}
            onClick={handleRegisterFutureYear}
          >
            {extendedYearRegistered
              ? "Year 2100 Already Registered!"
              : "Dynamically Register BS Year 2100 (Runtime Extender)"}
          </Button>
        </Space>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text strong>Today in Bikram Sambat: </Text>
        <Tag color="gold">{todayBs}</Tag>
        <Tag color="geekblue">{nepaliDateNow.format("dddd, MMMM DD, YYYY")}</Tag>
      </div>
    </Card>
  );
};
