import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, List, Tag, Empty, Row, Col, Statistic } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AppHeader } from '../components/Header';
import { dashboardAPI } from '../services/dataService';
import type { WasteAlert } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<WasteAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getWasteAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh alerts every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[severity] || 'default';
  };

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, React.ReactNode> = {
      high: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      medium: <WarningOutlined style={{ color: '#faad14' }} />,
      low: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    };
    return icons[severity] || <ClockCircleOutlined />;
  };

  // Calculate alert statistics
  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;
  const lowAlerts = alerts.filter(a => a.severity === 'low').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AppHeader alertCount={alerts.length} />
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Waste Alerts
            </Title>
            <Text type="secondary">Real-time monitoring and alerts for waste reduction opportunities</Text>
          </div>

          {/* Alert Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ background: '#fff1f0', borderLeft: '4px solid #ff4d4f' }}>
                <Statistic
                  title="High Priority"
                  value={highAlerts}
                  prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ background: '#fffbe6', borderLeft: '4px solid #faad14' }}>
                <Statistic
                  title="Medium Priority"
                  value={mediumAlerts}
                  prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ background: '#f6ffed', borderLeft: '4px solid #52c41a' }}>
                <Statistic
                  title="Low Priority"
                  value={lowAlerts}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Alerts List */}
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            title={<Text strong>Active Alerts ({alerts.length})</Text>}
            loading={loading}
          >
            {alerts.length === 0 ? (
              <Empty
                description="No active alerts"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={alerts}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} alerts`,
                }}
                renderItem={(alert) => (
                  <List.Item
                    key={alert.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      marginBottom: 12,
                      background: '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ fontSize: 24 }}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag color={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(alert.timestamp).fromNow()}
                            </Text>
                          </div>
                          <Text strong style={{ fontSize: 15, display: 'block' }}>
                            {alert.actionTitle}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {alert.message}
                          </Text>
                          <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 12 }}>
                              <Text type="secondary">Job ID:</Text>{' '}
                              <Text strong code>{alert.jobId}</Text>
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                              <Text type="secondary">Job Name:</Text>{' '}
                              <Text strong>{alert.jobName}</Text>
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                              <Text type="secondary">Confidence:</Text>{' '}
                              <Text strong style={{ color: alert.confidence > 0.8 ? '#52c41a' : '#faad14' }}>
                                {(alert.confidence * 100).toFixed(0)}%
                              </Text>
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                              <Text type="secondary">Time:</Text>{' '}
                              <Text>{dayjs(alert.timestamp).format('MM/DD/YYYY HH:mm:ss')}</Text>
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      </div>
    </div>
  );
};
