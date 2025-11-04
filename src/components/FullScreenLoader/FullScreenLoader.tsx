import React from 'react';
import { Progress, Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useLoading } from '../../contexts/LoadingContext';
import './FullScreenLoader.css';

const { Title, Text } = Typography;

export const FullScreenLoader: React.FC = () => {
  const { isLoading, progress, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fullscreen-loader-overlay">
      <div className="fullscreen-loader-content">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large"
        />
        <Title level={4} style={{ marginTop: 24, marginBottom: 8, color: '#fff' }}>
          {message}
        </Title>
        <Text style={{ color: '#fff', opacity: 0.8, marginBottom: 24, display: 'block' }}>
          Please wait, do not close or refresh this page
        </Text>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Progress
            percent={progress}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            format={(percent) => `${percent}%`}
          />
        </div>
      </div>
    </div>
  );
};
