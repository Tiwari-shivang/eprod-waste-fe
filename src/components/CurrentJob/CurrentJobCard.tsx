import React from 'react';
import { Card, Row, Col, Button, Typography, Progress, Divider } from 'antd';
import { WasteRiskMeter } from '../shared';
import type { CurrentJob } from '../../types';

const { Title, Text } = Typography;

interface CurrentJobCardProps {
  job: CurrentJob;
  onViewDetails: () => void;
}

export const CurrentJobCard: React.FC<CurrentJobCardProps> = ({ job, onViewDetails }) => {
  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>Current Job</Title>}
      bordered={false}
      style={{ height: '100%' }}
    >
      <Row gutter={[24, 24]}>
        {/* Left Column - Job Details */}
        <Col xs={24} md={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Job Name */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Job Name
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.jobName}</Text>
            </div>

            {/* Operator ID */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Operator ID
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.operatorId}</Text>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Progress</Text>
                <Text strong style={{ fontSize: 14 }}>{job.completion}%</Text>
              </div>
              <Progress
                percent={job.completion}
                strokeColor="#1677ff"
                trailColor="#e8e8e8"
                showInfo={false}
                strokeWidth={10}
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Paper Type */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Paper Type
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.paperGrade}</Text>
            </div>

            {/* Paper Grade */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Paper Grade
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.thickness}</Text>
            </div>

            {/* Flute */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Flute
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.flute}</Text>
            </div>

            {/* Thickness */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Thickness
              </Text>
              <Text strong style={{ fontSize: 14 }}>{job.thickness}</Text>
            </div>

            <Button type="primary" onClick={onViewDetails} block size="large" style={{ marginTop: 12 }}>
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
            paddingTop: 20
          }}>
            <WasteRiskMeter risk={Math.round(job.wasteRisk)} size={180} />

            <div style={{
              width: '100%',
              marginTop: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f0f7ff',
                borderRadius: 8,
                border: '1px solid #d6e4ff'
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Predicted Setup Waste
                </Text>
                <Text strong style={{ fontSize: 20, color: '#1677ff' }}>
                  {job.predictedSetupWaste.toFixed(1)} kg
                </Text>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#fffbf0',
                borderRadius: 8,
                border: '1px solid #ffe7ba'
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Predicted Dry-end Waste
                </Text>
                <Text strong style={{ fontSize: 20, color: '#faad14' }}>
                  {job.predictedDryEndWaste.toFixed(2)}%
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
