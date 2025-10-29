import React from 'react';
import { Card, Table, Progress, Typography, Space, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { InProgressJob } from '../../types';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface InProgressJobsTableProps {
  jobs: InProgressJob[];
  onJobClick?: (jobId: string) => void;
  onViewAll?: () => void;
  pageSize?: number;
  showCard?: boolean;
}

export const InProgressJobsTable: React.FC<InProgressJobsTableProps> = ({
  jobs,
  onJobClick,
  onViewAll,
  pageSize = 5,
  showCard = true
}) => {
  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'success';
    if (risk < 60) return 'warning';
    return 'error';
  };

  const columns: ColumnsType<InProgressJob> = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (text: string) => (
        <Text
          style={{ cursor: 'pointer', color: '#1677ff' }}
          onClick={() => onJobClick?.(text)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Paper Grade',
      dataIndex: 'paperGrade',
      key: 'paperGrade',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Flute',
      dataIndex: 'flute',
      key: 'flute',
      width: 80,
      align: 'center',
    },
    {
      title: 'Completion',
      dataIndex: 'completion',
      key: 'completion',
      width: 150,
      render: (value: number) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text style={{ fontSize: 12 }}>{value}%</Text>
          <Progress
            percent={value}
            size="small"
            strokeColor="#1677ff"
            showInfo={false}
          />
        </Space>
      ),
      sorter: (a, b) => a.completion - b.completion,
    },
    {
      title: 'Predicted Waste (kg)',
      dataIndex: 'predictedSetupWaste',
      key: 'predictedSetupWaste',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: '#faad14' }}>
          {value?.toFixed(1) || '-'}
        </Text>
      ),
      sorter: (a, b) => (a.predictedSetupWaste || 0) - (b.predictedSetupWaste || 0),
    },
    {
      title: 'Production Req (kg)',
      dataIndex: 'productionRequirement',
      key: 'productionRequirement',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {value?.toFixed(1) || '-'}
        </Text>
      ),
      sorter: (a, b) => (a.productionRequirement || 0) - (b.productionRequirement || 0),
    },
    {
      title: 'Suggested Speed (m/min)',
      dataIndex: 'speed',
      key: 'speed',
      width: 160,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(1) || '-'}</Text>
      ),
      sorter: (a, b) => (a.speed || 0) - (b.speed || 0),
    },
    {
      title: 'Suggested Temp (°C)',
      dataIndex: 'steam',
      key: 'steam',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(1) || '-'}</Text>
      ),
      sorter: (a, b) => (a.steam || 0) - (b.steam || 0),
    },
    {
      title: 'Glue Gap (μm)',
      dataIndex: 'glueGap',
      key: 'glueGap',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(0) || '-'}</Text>
      ),
      sorter: (a, b) => (a.glueGap || 0) - (b.glueGap || 0),
    },
    {
      title: 'Moisture (%)',
      dataIndex: 'moisture',
      key: 'moisture',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(2) || '-'}</Text>
      ),
      sorter: (a, b) => (a.moisture || 0) - (b.moisture || 0),
    },
    {
      title: 'Wrap Arm (°)',
      dataIndex: 'wrapArm',
      key: 'wrapArm',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(0) || '-'}</Text>
      ),
      sorter: (a, b) => (a.wrapArm || 0) - (b.wrapArm || 0),
    },
    {
      title: 'Vibrations (mm/s)',
      dataIndex: 'vibrations',
      key: 'vibrations',
      width: 140,
      align: 'right',
      render: (value: number) => (
        <Text>{value?.toFixed(2) || '-'}</Text>
      ),
      sorter: (a, b) => (a.vibrations || 0) - (b.vibrations || 0),
    },
    {
      title: 'AI Confidence',
      dataIndex: 'actionConfidence',
      key: 'actionConfidence',
      width: 130,
      align: 'center',
      render: (value: number) => (
        <Text style={{ color: value > 0.8 ? '#52c41a' : value > 0.6 ? '#faad14' : '#ff4d4f' }}>
          {value ? `${(value * 100).toFixed(0)}%` : '-'}
        </Text>
      ),
      sorter: (a, b) => (a.actionConfidence || 0) - (b.actionConfidence || 0),
    },
    {
      title: 'Waste Risk',
      dataIndex: 'wasteRisk',
      key: 'wasteRisk',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color={getRiskColor(value)}>
          {value.toFixed(0)}%
        </Tag>
      ),
      sorter: (a, b) => a.wasteRisk - b.wasteRisk,
    },
  ];

  const tableContent = (
    <Table
      columns={columns}
      dataSource={jobs}
      rowKey="jobId"
      pagination={{
        pageSize: pageSize,
        size: 'small',
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} jobs`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      size="small"
      scroll={{ x: 2000, y: showCard ? 300 : undefined }}
    />
  );

  if (!showCard) {
    return tableContent;
  }

  return (
    <Card
      title="In-Progress Jobs"
      bordered={false}
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', height: '100%' }}
      extra={
        onViewAll && (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={onViewAll}
            size="small"
          >
            View All
          </Button>
        )
      }
    >
      {tableContent}
    </Card>
  );
};
