import React from 'react';
import { Drawer, Descriptions, Space, Typography, Tag, Divider, Row, Col, Card, Statistic } from 'antd';
import {
  ClockCircleOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { CurrentJob } from '../../types';

const { Title, Text } = Typography;

interface JobDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  job: CurrentJob | null;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({ open, onClose, job }) => {
  if (!job) return null;

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      run: 'success',
      setup: 'processing',
      adjust: 'warning',
      alert: 'error',
    };
    return colors[eventType] || 'default';
  };

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Job Details
          </Text>
          <Title level={4} style={{ margin: 0 }}>
            {job.jobId}
          </Title>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Job Status */}
        <Card bordered={false} style={{ background: '#fafafa' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Status"
                value={job.eventType.toUpperCase()}
                valueStyle={{ fontSize: 18 }}
                prefix={<Tag color={getEventTypeColor(job.eventType)}></Tag>}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Completion"
                value={job.completion}
                suffix="%"
                valueStyle={{ fontSize: 18, color: '#1677ff' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Job Information */}
        <div>
          <Title level={5}>Job Information</Title>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Job ID">{job.jobId}</Descriptions.Item>
            <Descriptions.Item label="Job Name">{job.jobName}</Descriptions.Item>
            <Descriptions.Item label="Operator ID">
              <Tag color="blue">{job.operatorId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Paper Grade">{job.paperGrade}</Descriptions.Item>
            <Descriptions.Item label="Flute Type">{job.flute}</Descriptions.Item>
            <Descriptions.Item label="Thickness">{job.thickness}</Descriptions.Item>
          </Descriptions>
        </div>

        {/* Process Parameters */}
        <div>
          <Title level={5}>
            <ThunderboltOutlined /> Process Parameters
          </Title>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Speed">
              <Text strong>{job.speed.toFixed(1)} m/min</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Steam Temperature">
              <Text strong>{job.steam.toFixed(1)}°C</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* AI Recommendations */}
        <div>
          <Title level={5}>
            <ExperimentOutlined /> AI Recommendations
          </Title>
          <Card bordered={false} style={{ background: '#e6f4ff', borderLeft: '4px solid #1677ff' }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 14, color: '#0958d9' }}>
                  {job.actionTitle}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                  Confidence: {(job.actionConfidence * 100).toFixed(0)}%
                </Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  Recommended Actions:
                </Text>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  {job.actionSteps.slice(0, 4).map((step, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', background: '#fff', borderRadius: 4, border: '1px solid #d6e4ff' }}>
                      <Text style={{ fontSize: 13 }}>
                        {idx + 1}. {typeof step === 'string' ? step : step.step}
                      </Text>
                    </div>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        </div>

        <Divider />

        {/* Waste Summary */}
        <div>
          <Title level={5}>
            <ExperimentOutlined /> Waste Summary
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card bordered={false} style={{ background: '#f6ffed' }}>
                <Statistic
                  title="Predicted Total Waste"
                  value={job.predictedSetupWaste.toFixed(1)}
                  suffix="kg"
                  valueStyle={{ fontSize: 20, color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={{ background: '#fff7e6' }}>
                <Statistic
                  title="Actual Waste"
                  value={job.predictedDryEndWaste.toFixed(1)}
                  suffix="kg"
                  valueStyle={{ fontSize: 20, color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Risk Assessment */}
        <div>
          <Title level={5}>
            <WarningOutlined /> Risk Assessment
          </Title>
          <Card bordered={false} style={{ background: '#fff1f0' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Waste Risk Level"
                  value={Math.round(job.wasteRisk)}
                  suffix="%"
                  valueStyle={{
                    fontSize: 20,
                    color: job.wasteRisk > 60 ? '#ff4d4f' : job.wasteRisk > 30 ? '#faad14' : '#52c41a',
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="AI Confidence"
                  value={(job.actionConfidence * 100).toFixed(0)}
                  suffix="%"
                  valueStyle={{ fontSize: 20, color: '#1677ff' }}
                  prefix={<ExperimentOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Title level={5}>
            <ClockCircleOutlined /> Job Timeline
          </Title>
          <Text type="secondary">
            Real-time monitoring and AI-driven insights are continuously updated during job execution.
            Check the main dashboard for live updates and alerts.
          </Text>
        </div>
      </Space>
    </Drawer>
  );
};
