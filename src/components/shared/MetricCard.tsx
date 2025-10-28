import React from 'react';
import { Card, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix,
  trend,
  icon,
  color = '#2563eb',
}) => {
  const trendColor = trend && trend > 0 ? '#10b981' : trend && trend < 0 ? '#ef4444' : '#64748b';

  return (
    <Card
      bordered={false}
      style={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
      }}
      className="metric-card"
    >
      <style>{`
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
          {title}
        </Text>
        <Space align="center" size={12}>
          {icon && (
            <div
              style={{
                fontSize: 28,
                color,
                padding: 8,
                background: `${color}15`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
          <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>
            {value}
            {suffix && (
              <Text style={{ fontSize: 18, marginLeft: 6, color: '#64748b', fontWeight: 500 }}>
                {suffix}
              </Text>
            )}
          </Title>
        </Space>
        {trend !== undefined && (
          <Space align="center" size={6}>
            {trend > 0 ? (
              <ArrowUpOutlined style={{ color: trendColor, fontSize: 14, fontWeight: 600 }} />
            ) : trend < 0 ? (
              <ArrowDownOutlined style={{ color: trendColor, fontSize: 14, fontWeight: 600 }} />
            ) : null}
            <Text style={{ fontSize: 13, color: trendColor, fontWeight: 500 }}>
              {Math.abs(trend)}% vs last period
            </Text>
          </Space>
        )}
      </Space>
    </Card>
  );
};
