import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  DeleteOutlined,
  AlertOutlined,
  DisconnectOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricCard } from '../shared';
import type { KPIData, KPIChartData } from '../../types';

interface KPISectionProps {
  kpiData: KPIData;
  chartData: KPIChartData[];
}

export const KPISection: React.FC<KPISectionProps> = ({ kpiData, chartData }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Waste Saved"
            value={kpiData.totalWasteSaved.toFixed(0)}
            suffix="kg"
            trend={kpiData.wasteSavedPercentage}
            icon={<DeleteOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Active Alerts"
            value={kpiData.activeAlerts}
            icon={<AlertOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Offline Events"
            value={kpiData.offlineEvents}
            icon={<DisconnectOutlined />}
            color="#ff4d4f"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="AI Accuracy"
            value={kpiData.avgAccuracy.toFixed(0)}
            suffix="%"
            icon={<BarChartOutlined />}
            color="#1677ff"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="KPI Summary - Waste Trend" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  stroke="#8c8c8c"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#8c8c8c"
                  label={{ value: 'Waste (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="waste"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Actual Waste"
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#52c41a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Predicted Waste"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
