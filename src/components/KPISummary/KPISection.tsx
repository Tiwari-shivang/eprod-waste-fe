import React from 'react';
import { Row, Col, Card, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChartOutlined } from '@ant-design/icons';
import { InProgressJobsTable } from '../JobTables';
import type { KPIChartData, InProgressJob } from '../../types';

interface KPISectionProps {
  chartData: KPIChartData[];
  inProgressJobs: InProgressJob[];
  onJobClick?: (jobId: string) => void;
  onViewAll?: () => void;
  onViewAnalytics?: () => void;
}

export const KPISection: React.FC<KPISectionProps> = ({ chartData, inProgressJobs, onJobClick, onViewAll, onViewAnalytics }) => {
  const cardHeight = 480; // Fixed height for both sides

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Left side - Waste Trend Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="KPI Summary - Waste Trend"
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', height: cardHeight, cursor: 'pointer' }}
            extra={
              onViewAnalytics && (
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  onClick={onViewAnalytics}
                  size="small"
                >
                  View Analytics
                </Button>
              )
            }
            onClick={onViewAnalytics}
          >
            <ResponsiveContainer width="100%" height={cardHeight - 90}>
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
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  name="Actual Waste"
                  activeDot={{ r: 7, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  name="Predicted Waste"
                  activeDot={{ r: 7, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Right side - In-Progress Jobs Table */}
        <Col xs={24} lg={12}>
          <div style={{ height: cardHeight }}>
            <InProgressJobsTable
              jobs={inProgressJobs}
              onJobClick={onJobClick}
              onViewAll={onViewAll}
              pageSize={5}
              showCard={true}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};
