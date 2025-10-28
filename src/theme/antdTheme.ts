import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Modern color palette
    colorPrimary: '#2563eb', // Vibrant blue
    colorSuccess: '#10b981', // Modern green
    colorWarning: '#f59e0b', // Amber
    colorError: '#ef4444', // Modern red
    colorInfo: '#3b82f6', // Sky blue

    // Typography
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,

    // Colors
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',

    // Spacing
    lineHeight: 1.6,
  },
  components: {
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.08)',
      headerFontSize: 16,
      headerFontSizeSM: 14,
    },
    Progress: {
      defaultColor: '#2563eb',
      circleTextColor: '#1e293b',
    },
    Table: {
      borderRadius: 10,
      headerBg: '#f1f5f9',
      headerColor: '#475569',
      rowHoverBg: '#f8fafc',
      borderColor: '#e2e8f0',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      controlHeightLG: 44,
      fontWeight: 500,
      primaryShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
    },
    Tag: {
      borderRadiusSM: 6,
      fontSizeSM: 12,
    },
    Modal: {
      borderRadiusLG: 12,
      paddingContentHorizontalLG: 24,
    },
  },
};
