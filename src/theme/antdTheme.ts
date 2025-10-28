import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBorder: '#e8e8e8',
  },
  components: {
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
    },
    Progress: {
      defaultColor: '#1677ff',
    },
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
    },
    Button: {
      borderRadius: 6,
      controlHeight: 36,
    },
  },
};
