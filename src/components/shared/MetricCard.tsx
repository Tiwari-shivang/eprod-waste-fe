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
  color = '#1677ff',
}) => {
  const trendColor = trend && trend > 0 ? '#52c41a' : trend && trend < 0 ? '#ff4d4f' : '#8c8c8c';

  return (
    <Card
      bordered={false}
      style={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {title}
        </Text>
        <Space align="center" size={12}>
          {icon && <div style={{ fontSize: 24, color }}>{icon}</div>}
          <Title level={3} style={{ margin: 0, color }}>
            {value}
            {suffix && (
              <Text style={{ fontSize: 16, marginLeft: 4 }} type="secondary">
                {suffix}
              </Text>
            )}
          </Title>
        </Space>
        {trend !== undefined && (
          <Space align="center" size={4}>
            {trend > 0 ? (
              <ArrowUpOutlined style={{ color: trendColor, fontSize: 12 }} />
            ) : trend < 0 ? (
              <ArrowDownOutlined style={{ color: trendColor, fontSize: 12 }} />
            ) : null}
            <Text style={{ fontSize: 12, color: trendColor }}>
              {Math.abs(trend)}% vs last period
            </Text>
          </Space>
        )}
      </Space>
    </Card>
  );
};
