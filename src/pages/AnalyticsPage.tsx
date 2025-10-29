import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Space, Statistic } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { AppHeader } from '../components/Header';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { dashboardAPI } from '../services/dataService';
import type { KPIChartData } from '../types';

const { Title, Text } = Typography;

// Color palette for paper grades
const GRADE_COLORS = ['#2563eb', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpiChartData, setKpiChartData] = useState<KPIChartData[]>([]);
  const [wasteByPaperType, setWasteByPaperType] = useState<any[]>([]);
  const [aiConfidenceTrend, setAiConfidenceTrend] = useState<any[]>([]);
  const [wasteOverTime, setWasteOverTime] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Sample data for AI Confidence Trend (last 5 days)
        const confidenceData = [
          { date: '2025-10-24', confidence: 45, color: '#ff4d4f' },
          { date: '2025-10-25', confidence: 64, color: '#faad14' },
          { date: '2025-10-26', confidence: 61, color: '#faad14' },
          { date: '2025-10-27', confidence: 79, color: '#faad14' },
          { date: '2025-10-28', confidence: 88, color: '#52c41a' },
        ];

        // Sample data for Waste Over Time (last 5 days)
        const wasteData = [
          { date: '2025-10-24', wastage: 282, production: 470, wastePercent: 60 },
          { date: '2025-10-25', wastage: 150, production: 500, wastePercent: 30 },
          { date: '2025-10-26', wastage: 157.5, production: 450, wastePercent: 35 },
          { date: '2025-10-27', wastage: 134.4, production: 480, wastePercent: 28 },
          { date: '2025-10-28', wastage: 78, production: 520, wastePercent: 15 },
        ];

        // Sample data for Wastage by Paper Type
        const paperTypeData = [
          { grade: 'Grade A', wastage: 450, count: 25 },
          { grade: 'Grade B', wastage: 380, count: 20 },
          { grade: 'Grade C', wastage: 520, count: 30 },
          { grade: 'Grade D', wastage: 290, count: 15 },
          { grade: 'Grade E', wastage: 610, count: 35 },
        ];

        const [kpi] = await Promise.all([
          dashboardAPI.getKPIChartData(),
        ]);

        setKpiChartData(kpi);
        setAiConfidenceTrend(confidenceData);
        setWasteOverTime(wasteData);
        setWasteByPaperType(paperTypeData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary stats
  const totalPaperWaste = wasteByPaperType.reduce((sum, item) => sum + item.wastage, 0);
  const avgConfidence = aiConfidenceTrend.length > 0
    ? aiConfidenceTrend.reduce((sum, item) => sum + item.confidence, 0) / aiConfidenceTrend.length
    : 0;
  const totalWasteOverTime = wasteOverTime.reduce((sum, item) => sum + item.wastage, 0);
  const wasteReduction = wasteOverTime.length >= 2
    ? ((wasteOverTime[0].wastePercent - wasteOverTime[wasteOverTime.length - 1].wastePercent) / wasteOverTime[0].wastePercent * 100).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AppHeader />
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Advanced Analytics
          </Title>
          <Text type="secondary">Comprehensive insights into production performance and AI effectiveness</Text>
        </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Paper Waste</Text>}
              value={totalPaperWaste.toFixed(1)}
              suffix="kg"
              valueStyle={{ color: '#fff', fontSize: 24 }}
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Avg AI Confidence</Text>}
              value={avgConfidence.toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#fff', fontSize: 24 }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Waste (5 Days)</Text>}
              value={totalWasteOverTime.toFixed(1)}
              suffix="kg"
              valueStyle={{ color: '#fff', fontSize: 24 }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Waste Reduction</Text>}
              value={wasteReduction}
              suffix="%"
              valueStyle={{ color: '#fff', fontSize: 24 }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Grid */}
      <Row gutter={[16, 16]}>
        {/* Chart 1: KPI Summary - Waste Trend */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            loading={loading}
            title={
              <Space>
                <LineChartOutlined style={{ color: '#1677ff' }} />
                <Text strong>KPI Summary - Waste Trend</Text>
              </Space>
            }
            extra={<Text type="secondary">Last 25 data points</Text>}
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={kpiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#8c8c8c" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{ value: 'Waste (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="waste"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  name="Actual Waste"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  name="Predicted Waste"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Chart 2: Wastage for Paper Type */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            loading={loading}
            title={
              <Space>
                <BarChartOutlined style={{ color: '#52c41a' }} />
                <Text strong>Wastage for Paper Type</Text>
              </Space>
            }
            extra={<Text type="secondary">Total: {totalPaperWaste.toFixed(1)} kg</Text>}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={wasteByPaperType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} stroke="#8c8c8c" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{ value: 'Wastage (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="wastage" name="Wastage" radius={[8, 8, 0, 0]}>
                  {wasteByPaperType.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Chart 3: AI Confidence Trend */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            loading={loading}
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#722ed1' }} />
                <Text strong>AI Confidence Trend Over Time</Text>
              </Space>
            }
            extra={<Text type="secondary">Last 5 days</Text>}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={aiConfidenceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8c8c8c" />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="confidence" name="AI Confidence" radius={[8, 8, 0, 0]}>
                  {aiConfidenceTrend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Chart 4: Waste Generation Over Time */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            loading={loading}
            title={
              <Space>
                <LineChartOutlined style={{ color: '#faad14' }} />
                <Text strong>Waste Generation Over Time</Text>
              </Space>
            }
            extra={<Text type="secondary">Last 5 days</Text>}
          >
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={wasteOverTime}>
                <defs>
                  <linearGradient id="colorWastage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8c8c8c" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#52c41a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProduction)"
                  name="Production"
                />
                <Area
                  type="monotone"
                  dataKey="wastage"
                  stroke="#ff4d4f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWastage)"
                  name="Wastage"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>
      </div>
    </div>
  );
};
