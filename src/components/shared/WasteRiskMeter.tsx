import React from 'react';
import { Progress, Space, Typography } from 'antd';

const { Text } = Typography;

interface WasteRiskMeterProps {
  risk: number;
  size?: number;
}

export const WasteRiskMeter: React.FC<WasteRiskMeterProps> = ({ risk, size = 180 }) => {
  const getColor = (value: number) => {
    if (value < 30) return '#52c41a';
    if (value < 60) return '#faad14';
    return '#ff4d4f';
  };

  const getStatus = (value: number) => {
    if (value < 30) return 'Low';
    if (value < 60) return 'Medium';
    return 'High';
  };

  return (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <Progress
        type="circle"
        percent={risk}
        size={size}
        strokeColor={getColor(risk)}
        format={(percent) => (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: size / 6, fontWeight: 'bold', color: getColor(risk) }}>
              {percent}%
            </div>
            <div style={{ fontSize: size / 12, color: '#8c8c8c' }}>
              {getStatus(risk)}
            </div>
          </div>
        )}
      />
      <Text strong style={{ fontSize: 14, marginTop: 8 }}>
        Waste Risk
      </Text>
    </Space>
  );
};
