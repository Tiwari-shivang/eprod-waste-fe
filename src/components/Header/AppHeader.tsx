import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Badge, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  BellOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface AppHeaderProps {
  alertCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ alertCount = 3 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current route
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/in-progress') return 'in-progress';
    if (path === '/upcoming') return 'upcoming';
    if (path === '/historical-data') return 'historical-data';
    if (path === '/analytics') return 'analytics';
    if (path === '/alerts') return 'alerts';
    return 'dashboard';
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Dashboard</Text>,
      onClick: () => navigate('/'),
    },
    {
      key: 'in-progress',
      icon: <ClockCircleOutlined style={{ fontSize: 16 }} />,
      label: <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>In Progress</Text>,
      onClick: () => navigate('/in-progress'),
    },
    {
      key: 'upcoming',
      icon: <CalendarOutlined style={{ fontSize: 16 }} />,
      label: <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Upcoming</Text>,
      onClick: () => navigate('/upcoming'),
    },
    {
      key: 'historical-data',
      icon: <DatabaseOutlined style={{ fontSize: 16 }} />,
      label: <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Historical Logs</Text>,
      onClick: () => navigate('/historical-data'),
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined style={{ fontSize: 16 }} />,
      label: <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Analytics</Text>,
      onClick: () => navigate('/analytics'),
    },
    {
      key: 'alerts',
      icon: <BellOutlined style={{ fontSize: 16 }} />,
      label: (
        <Badge count={alertCount} offset={[10, 0]} size="small" showZero>
          <Text style={{ fontSize: 14, fontWeight: 500, color: 'inherit', paddingRight: 8 }}>Alerts</Text>
        </Badge>
      ),
      onClick: () => navigate('/alerts'),
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0 32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1920,
          margin: '0 auto',
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            padding: '12px 0',
          }}
          onClick={() => navigate('/')}
        >
          {/* AI Icon Logo */}
          <div
            style={{
              width: 48,
              height: 48,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <ThunderboltOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>

          {/* Logo Text */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text
              strong
              style={{
                color: '#fff',
                fontSize: 18,
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              Corrugator AI
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: 11,
                lineHeight: 1.2,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Waste Intelligence
            </Text>
          </div>
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[getCurrentKey()]}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            flex: 1,
            justifyContent: 'flex-end',
            minWidth: 0,
          }}
          theme="dark"
        />
      </div>
    </div>
  );
};
