import React from 'react';
import { List, Tag, Space, Typography, Empty } from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { WasteAlert } from '../../types';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface WastePredictionAlertsProps {
  alerts: WasteAlert[];
}

export const WastePredictionAlerts: React.FC<WastePredictionAlertsProps> = ({ alerts }) => {
  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <WarningOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
      case 'medium':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />;
      case 'low':
        return <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'processing';
    }
  };

  return (
    <>
      {alerts.length === 0 ? (
        <Empty
          image={<CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />}
          description={
            <Space direction="vertical" size={4}>
              <Text strong>No Active Alerts</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                All systems operating within normal parameters
              </Text>
            </Space>
          }
        />
      ) : (
        <List
          dataSource={alerts}
          renderItem={(alert) => (
            <List.Item
              key={alert.id}
              style={{
                padding: '16px',
                borderLeft: `4px solid ${
                  alert.severity === 'high' ? '#ff4d4f' : alert.severity === 'medium' ? '#faad14' : '#1677ff'
                }`,
                marginBottom: 12,
                background: '#fafafa',
                borderRadius: 8,
              }}
            >
              <List.Item.Meta
                avatar={getSeverityIcon(alert.severity)}
                title={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      <Tag color={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Tag>
                      <Text strong>{alert.jobId}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(alert.timestamp).format('MM/DD HH:mm:ss')}
                      </Text>
                    </Space>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 8 }}>
                    <Paragraph style={{ margin: 0, fontSize: 13 }}>
                      {alert.message}
                    </Paragraph>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        AI Confidence:
                      </Text>
                      <Tag color={alert.confidence > 0.8 ? 'success' : alert.confidence > 0.6 ? 'warning' : 'default'}>
                        {(alert.confidence * 100).toFixed(0)}%
                      </Tag>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </>
  );
};
