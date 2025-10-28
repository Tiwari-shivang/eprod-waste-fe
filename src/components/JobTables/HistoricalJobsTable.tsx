import React from 'react';
import { Card, Table, Tag, Typography, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { HistoricalJob } from '../../types';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface HistoricalJobsTableProps {
  jobs: HistoricalJob[];
  onJobClick?: (jobId: string) => void;
  onViewAll?: () => void;
  pageSize?: number;
  showCard?: boolean;
}

export const HistoricalJobsTable: React.FC<HistoricalJobsTableProps> = ({
  jobs,
  onJobClick,
  onViewAll,
  pageSize = 5,
  showCard = true
}) => {
  const columns: ColumnsType<HistoricalJob> = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 180,
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
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 140,
      ellipsis: true,
      render: (value: string) => (
        <Tag color="blue">{value}</Tag>
      ),
    },
    {
      title: 'Waste (kg)',
      dataIndex: 'waste',
      key: 'waste',
      width: 100,
      align: 'right',
      render: (value: number) => <Text strong>{value.toFixed(1)}</Text>,
      sorter: (a, b) => a.waste - b.waste,
    },
    {
      title: 'Saved (kg)',
      dataIndex: 'saved',
      key: 'saved',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: value > 0 ? '#52c41a' : '#8c8c8c' }}>
          {value > 0 ? '+' : ''}
          {value.toFixed(1)}
        </Text>
      ),
      sorter: (a, b) => a.saved - b.saved,
    },
    {
      title: 'Shift Time',
      dataIndex: 'shiftTime',
      key: 'shiftTime',
      width: 180,
      ellipsis: true,
      render: (value: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {value}
        </Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      render: (value: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(value).format('MM/DD HH:mm')}
        </Text>
      ),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
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
      scroll={{ x: 800, y: showCard ? 300 : undefined }}
    />
  );

  if (!showCard) {
    return tableContent;
  }

  return (
    <Card
      title="Historical Jobs"
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
