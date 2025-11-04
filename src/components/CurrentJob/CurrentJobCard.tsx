/**
 * CurrentJobCard Component
 *
 * DATA SOURCES:
 * ============
 * This component displays job data from TWO sources:
 *
 * 1. REST API (http://localhost:5000/job-details?status=in-progress) - FETCHED ONCE
 *    - Job Name, Quantity, Paper Grade, Flute, Thickness
 *    - AI Recommendations (speed, temperature)
 *    - Predicted waste values
 *
 * 2. WebSocket (ws://localhost:8080/ws/653/fctm2qrr/websocket) - REAL-TIME
 *    - Progress (0-1 range) -> Converted to 0-100% for display
 *    - Generated waste (kg)
 *
 * The horizontal progress bar shows REAL-TIME WebSocket data ONLY.
 */
import React from 'react';
import { Card, Row, Col, Button, Typography, Progress, Divider, Space, Tag } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CompressOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
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
  onPauseJob?: (jobId: string) => void;
}

export const CurrentJobCard: React.FC<CurrentJobCardProps> = ({
  job,
  onViewDetails,
  onPreviousJob,
  onNextJob,
  currentIndex = 0,
  totalJobs = 1,
  onPauseJob,
}) => {
  const isPaused = job.eventType === 'paused';
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={12} align="center">
            <Title level={3} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
              Current Job
            </Title>
            {isPaused && (
              <Tag color="warning" style={{ fontSize: 14, padding: '4px 12px' }}>
                PAUSED - Editable
              </Tag>
            )}
            {!isPaused && (
              <Tag color="processing" style={{ fontSize: 14, padding: '4px 12px' }}>
                IN-PROGRESS
              </Tag>
            )}
          </Space>
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

            {/* Quantity */}
            <div style={{ padding: '14px', background: '#fafafa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
              <Space align="center" size={10}>
                <CompressOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Quantity
                  </Text>
                  <Text strong style={{ fontSize: 17, color: '#1f1f1f' }}>{job.quantity} units</Text>
                </div>
              </Space>
            </div>

            {/* Progress Bar - REAL-TIME FROM WEBSOCKET */}
            <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>Job Progress</Text>
                {/* job.completion comes from WebSocket (real-time updates with decimals) */}
                <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{job.completion.toFixed(2)}%</Text>
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

            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
              <Col span={onPauseJob ? 12 : 24}>
                <Button
                  type="primary"
                  onClick={onViewDetails}
                  block
                  size="large"
                  style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                >
                  View Job Details
                </Button>
              </Col>
              {onPauseJob && (
                <Col span={12}>
                  <Button
                    icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                    onClick={() => onPauseJob(job.jobId)}
                    block
                    size="large"
                    danger={!isPaused}
                    type={isPaused ? 'primary' : 'default'}
                    style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                </Col>
              )}
            </Row>
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

              {/* Waste Risk Reason - AI Action Steps Summary */}
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: job.wasteRisk > 60 ? '#fff1f0' : job.wasteRisk > 30 ? '#fffbe6' : '#f6ffed',
                borderRadius: 8,
                border: `1px solid ${job.wasteRisk > 60 ? '#ffccc7' : job.wasteRisk > 30 ? '#ffe58f' : '#b7eb8f'}`,
              }}>
                <Text strong style={{ fontSize: 13, color: '#1f1f1f', display: 'block', marginBottom: 8 }}>
                  AI Suggestions ({((job.actionConfidence || 0.85) * 100).toFixed(0)}% Confidence):
                </Text>
                <Text style={{ fontSize: 12, color: '#595959', lineHeight: '1.6', display: 'block', textAlign: 'justify' }}>
                  Based on current job parameters and historical data analysis, the AI recommends adjusting the steam temperature to {job.steam.toFixed(1)}°C and optimizing the machine speed to {job.speed.toFixed(1)} m/min for optimal results. Please monitor the {job.paperGrade} grade paper handling carefully throughout the process and ensure tension settings are properly adjusted for the {job.flute} flute type configuration to minimize waste generation.
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
