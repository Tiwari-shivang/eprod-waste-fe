import React from 'react';
import { Card, Row, Col, Button, Typography, Progress, Divider, Space } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { WasteRiskMeter } from '../shared';
import type { CurrentJob } from '../../types';

const { Title, Text } = Typography;

interface CurrentJobCardProps {
  job: CurrentJob;
  onViewDetails: () => void;
  onPreviousJob?: () => void;
  onNextJob?: () => void;
  currentIndex?: number;
  totalJobs?: number;
}

export const CurrentJobCard: React.FC<CurrentJobCardProps> = ({
  job,
  onViewDetails,
  onPreviousJob,
  onNextJob,
  currentIndex = 0,
  totalJobs = 1,
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            Current Job
          </Title>
          <Space size={12}>
            <Button
              icon={<LeftOutlined />}
              onClick={onPreviousJob}
              disabled={!onPreviousJob || currentIndex === 0}
              size="large"
            />
            <Text strong style={{ fontSize: 15, minWidth: 80, textAlign: 'center', display: 'inline-block' }}>
              {currentIndex + 1} of {totalJobs}
            </Text>
            <Button
              icon={<RightOutlined />}
              onClick={onNextJob}
              disabled={!onNextJob || currentIndex >= totalJobs - 1}
              size="large"
            />
          </Space>
        </div>
      }
      bordered={false}
      style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
    >
      <Row gutter={[32, 32]}>
        {/* Left Column - Job Details */}
        <Col xs={24} md={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Job Name */}
            <div style={{ padding: '14px', background: '#fafafa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
              <Space align="center" size={10}>
                <FileTextOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Job Name
                  </Text>
                  <Text strong style={{ fontSize: 17, color: '#1f1f1f' }}>{job.jobName}</Text>
                </div>
              </Space>
            </div>

            {/* Operator ID */}
            <div style={{ padding: '14px', background: '#fafafa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
              <Space align="center" size={10}>
                <UserOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Operator
                  </Text>
                  <Text strong style={{ fontSize: 17, color: '#1f1f1f' }}>{job.operatorId}</Text>
                </div>
              </Space>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>Job Progress</Text>
                <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{job.completion}%</Text>
              </div>
              <Progress
                percent={job.completion}
                strokeColor="#1677ff"
                trailColor="#d6e4ff"
                showInfo={false}
                strokeWidth={12}
              />
            </div>

            <Divider style={{ margin: '10px 0' }} />

            {/* Material Specifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ padding: '12px', background: '#fff', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                    <Space align="center" size={8}>
                      <ExperimentOutlined style={{ fontSize: 16, color: '#faad14' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          Paper Type
                        </Text>
                        <Text strong style={{ fontSize: 15 }}>{job.paperGrade}</Text>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: '12px', background: '#fff', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                    <Space align="center" size={8}>
                      <CompressOutlined style={{ fontSize: 16, color: '#722ed1' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          Flute Type
                        </Text>
                        <Text strong style={{ fontSize: 15 }}>{job.flute}</Text>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: '12px', background: '#fff', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Thickness
                    </Text>
                    <Text strong style={{ fontSize: 15 }}>{job.thickness}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: '12px', background: '#fff', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Speed
                    </Text>
                    <Text strong style={{ fontSize: 15 }}>{job.speed.toFixed(0)} m/min</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Button
              type="primary"
              onClick={onViewDetails}
              block
              size="large"
              style={{ marginTop: 16, height: 48, fontSize: 16, fontWeight: 500 }}
            >
              View Job Details
            </Button>
          </div>
        </Col>

        {/* Right Column - Waste Risk Meter */}
        <Col xs={24} md={12}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            paddingTop: 8
          }}>
            <div style={{ marginBottom: 16, width: '100%' }}>
              <Text strong style={{ fontSize: 16, color: '#1f1f1f', display: 'block', textAlign: 'center', marginBottom: 16 }}>
                Waste Risk Assessment
              </Text>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <WasteRiskMeter risk={Math.round(job.wasteRisk)} size={200} />
              </div>

              {/* Waste Risk Reason */}
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: job.wasteRisk > 60 ? '#fff1f0' : job.wasteRisk > 30 ? '#fffbe6' : '#f6ffed',
                borderRadius: 8,
                border: `1px solid ${job.wasteRisk > 60 ? '#ffccc7' : job.wasteRisk > 30 ? '#ffe58f' : '#b7eb8f'}`,
                textAlign: 'center'
              }}>
                <Text style={{ fontSize: 13, color: '#595959', fontStyle: 'italic' }}>
                  {job.wasteRisk > 60
                    ? `High risk due to ${job.speed > 180 ? 'excessive speed' : 'suboptimal steam temperature'} and material grade complexity`
                    : job.wasteRisk > 30
                    ? `Moderate risk from ${job.flute === 'E' ? 'fine flute type' : 'current machine settings'} requiring careful monitoring`
                    : 'Low risk - optimal conditions maintained with recommended parameters'}
                </Text>
              </div>
            </div>

            {/* Waste Predictions - Side by Side */}
            <Row gutter={12} style={{ width: '100%', marginTop: 12 }}>
              <Col span={12}>
                <div style={{
                  textAlign: 'center',
                  padding: '14px 12px',
                  background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
                  borderRadius: 8,
                  border: '2px solid #91caff',
                  boxShadow: '0 2px 8px rgba(22, 119, 255, 0.15)'
                }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 500 }}>
                    Wet End Waste
                  </Text>
                  <Text strong style={{ fontSize: 22, color: '#0958d9', fontWeight: 600 }}>
                    {job.predictedSetupWaste.toFixed(1)} kg
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{
                  textAlign: 'center',
                  padding: '14px 12px',
                  background: 'linear-gradient(135deg, #fffbf0 0%, #ffe7ba 100%)',
                  borderRadius: 8,
                  border: '2px solid #ffd591',
                  boxShadow: '0 2px 8px rgba(250, 173, 20, 0.15)'
                }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 500 }}>
                    Dry End Waste
                  </Text>
                  <Text strong style={{ fontSize: 22, color: '#d48806', fontWeight: 600 }}>
                    {job.predictedDryEndWaste.toFixed(1)} kg
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
