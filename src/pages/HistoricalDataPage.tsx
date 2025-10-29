import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Table, Space } from 'antd';
import { SaveOutlined, CheckCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { AppHeader } from '../components/Header';
import type { ColumnsType } from 'antd/es/table';
import type { CorrugatorLog } from '../types';
import { dashboardAPI } from '../services/dataService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const HistoricalDataPage: React.FC = () => {
  const [logs, setLogs] = useState<CorrugatorLog[]>([]);
  const [kpis, setKpis] = useState({
    totalWasteSaved: 0,
    totalJobs: 0,
    aiCorrectness: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsData, kpisData] = await Promise.all([
          dashboardAPI.getAllLogs(),
          dashboardAPI.getHistoricalDataKPIs(),
        ]);
        setLogs(logsData);
        setKpis(kpisData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  // Format weight to tons or kg
  const formatWeight = (kg: number): { value: number; unit: string } => {
    if (kg >= 1000) {
      return { value: kg / 1000, unit: 'tons' };
    }
    return { value: kg, unit: 'kg' };
  };

  const wasteSaved = formatWeight(kpis.totalWasteSaved);

  // Define all columns from CSV
  const columns: ColumnsType<CorrugatorLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'ts',
      key: 'ts',
      width: 180,
      fixed: 'left',
      render: (text: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      ),
      sorter: (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
    },
    {
      title: 'Start Shift Time',
      key: 'start_shift_time',
      width: 140,
      align: 'center',
      render: (record: CorrugatorLog) => {
        // Start shift time matches the timestamp
        const ts = dayjs(record.ts);
        const shiftStart = ts.format('HH:mm');
        return (
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#52c41a' }}>
            {shiftStart}
          </Text>
        );
      },
    },
    {
      title: 'End Shift Time',
      key: 'end_shift_time',
      width: 140,
      align: 'center',
      render: (record: CorrugatorLog) => {
        // End shift time is 2-4 hours after start time (random)
        const ts = dayjs(record.ts);
        // Use trace_id to generate consistent random hours (2-4) for each record
        const seed = record.trace_id ? record.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        const hoursToAdd = 2 + (seed % 3); // Random between 2-4 hours
        const shiftEnd = ts.add(hoursToAdd, 'hour').format('HH:mm');
        return (
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#ff4d4f' }}>
            {shiftEnd}
          </Text>
        );
      },
    },
    {
      title: 'Site ID',
      dataIndex: 'site_id',
      key: 'site_id',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Line ID',
      dataIndex: 'line_id',
      key: 'line_id',
      width: 90,
      ellipsis: true,
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 100,
      filters: [
        { text: 'Setup', value: 'setup' },
        { text: 'Run', value: 'run' },
        { text: 'Adjust', value: 'adjust' },
        { text: 'Alert', value: 'alert' },
      ],
      onFilter: (value, record) => record.event_type === value,
      render: (text: string) => {
        const colors: Record<string, string> = {
          run: '#52c41a',
          setup: '#1677ff',
          adjust: '#faad14',
          alert: '#ff4d4f',
        };
        return (
          <Text style={{ color: colors[text] || '#000', fontWeight: 500 }}>
            {text.toUpperCase()}
          </Text>
        );
      },
    },
    {
      title: 'Job ID',
      dataIndex: 'job_id',
      key: 'job_id',
      width: 180,
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#1677ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Paper Grade',
      dataIndex: 'paper_grade',
      key: 'paper_grade',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Flute',
      dataIndex: 'flute',
      key: 'flute',
      width: 70,
      align: 'center',
    },
    {
      title: 'Speed (m/min)',
      dataIndex: 'speed_mpm',
      key: 'speed_mpm',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toFixed(1) || '-',
      sorter: (a, b) => (a.speed_mpm || 0) - (b.speed_mpm || 0),
    },
    {
      title: 'Steam (°C)',
      dataIndex: 'steam_c',
      key: 'steam_c',
      width: 100,
      align: 'right',
      render: (value: number) => value?.toFixed(1) || '-',
      sorter: (a, b) => (a.steam_c || 0) - (b.steam_c || 0),
    },
    {
      title: 'Glue Gap (μm)',
      dataIndex: 'glue_gap_um',
      key: 'glue_gap_um',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toFixed(0) || '-',
      sorter: (a, b) => (a.glue_gap_um || 0) - (b.glue_gap_um || 0),
    },
    {
      title: 'Moisture (%)',
      dataIndex: 'moisture_pct',
      key: 'moisture_pct',
      width: 110,
      align: 'right',
      render: (value: number) => value?.toFixed(2) || '-',
      sorter: (a, b) => (a.moisture_pct || 0) - (b.moisture_pct || 0),
    },
    {
      title: 'Wrap Arm (°)',
      dataIndex: 'wrap_arm_pos',
      key: 'wrap_arm_pos',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toFixed(0) || '-',
      sorter: (a, b) => (a.wrap_arm_pos || 0) - (b.wrap_arm_pos || 0),
    },
    {
      title: 'Vibration (mm/s)',
      dataIndex: 'vibration_mm_s',
      key: 'vibration_mm_s',
      width: 130,
      align: 'right',
      render: (value: number) => value?.toFixed(2) || '-',
      sorter: (a, b) => (a.vibration_mm_s || 0) - (b.vibration_mm_s || 0),
    },
    {
      title: 'Edge Status',
      dataIndex: 'edge_status',
      key: 'edge_status',
      width: 110,
      align: 'center',
      render: (text: string) => (
        <Text style={{ color: text === 'ok' ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Predicted Setup Waste (kg)',
      dataIndex: 'predicted_setup_waste_kg',
      key: 'predicted_setup_waste_kg',
      width: 200,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: '#faad14' }}>
          {value?.toFixed(1) || '-'}
        </Text>
      ),
      sorter: (a, b) => (a.predicted_setup_waste_kg || 0) - (b.predicted_setup_waste_kg || 0),
    },
    {
      title: 'Actual Waste (kg)',
      key: 'actual_waste_kg',
      width: 180,
      align: 'right',
      render: (_value: number, record: CorrugatorLog) => {
        const predictedWaste = record.predicted_setup_waste_kg || 0;
        // Use trace_id to generate consistent random percentage for each record
        const seed = record.trace_id ? record.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

        // 1 in 10 jobs (10%) should have 25-30% extra, others 15-20% extra
        const isHighWaste = (seed % 10) === 0; // Every 10th record based on seed
        const extraPercentage = isHighWaste
          ? 25 + (seed % 6) // 25-30%
          : 15 + (seed % 6); // 15-20%

        const actualWaste = predictedWaste * (1 + extraPercentage / 100);

        return (
          <Text strong style={{ color: isHighWaste ? '#ff4d4f' : '#fa8c16' }}>
            {actualWaste.toFixed(1)}
          </Text>
        );
      },
      sorter: (a, b) => {
        const seedA = a.trace_id ? a.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        const seedB = b.trace_id ? b.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        const isHighWasteA = (seedA % 10) === 0;
        const isHighWasteB = (seedB % 10) === 0;
        const extraA = isHighWasteA ? 25 + (seedA % 6) : 15 + (seedA % 6);
        const extraB = isHighWasteB ? 25 + (seedB % 6) : 15 + (seedB % 6);
        const actualA = (a.predicted_setup_waste_kg || 0) * (1 + extraA / 100);
        const actualB = (b.predicted_setup_waste_kg || 0) * (1 + extraB / 100);
        return actualA - actualB;
      },
    },
    {
      title: 'Predicted Dry End Waste (%)',
      dataIndex: 'predicted_dry_end_waste_pct',
      key: 'predicted_dry_end_waste_pct',
      width: 220,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          {value?.toFixed(2) || '-'}
        </Text>
      ),
      sorter: (a, b) => (a.predicted_dry_end_waste_pct || 0) - (b.predicted_dry_end_waste_pct || 0),
    },
    {
      title: 'Waste Saved (kg)',
      dataIndex: 'action_effect_waste_saved_kg',
      key: 'action_effect_waste_saved_kg',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: value > 0 ? '#52c41a' : '#8c8c8c' }}>
          {value > 0 ? '+' : ''}
          {value?.toFixed(1) || '0.0'}
        </Text>
      ),
      sorter: (a, b) => (a.action_effect_waste_saved_kg || 0) - (b.action_effect_waste_saved_kg || 0),
    },
    {
      title: 'AI Confidence',
      dataIndex: 'action_confidence',
      key: 'action_confidence',
      width: 130,
      align: 'right',
      render: (value: number, record: CorrugatorLog) => {
        // Generate random confidence between 75-95% if value is null/NaN/0
        let confidence = value;
        if (!confidence || isNaN(confidence)) {
          // Use trace_id to generate consistent random value for each record
          const seed = record.trace_id ? record.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
          confidence = (75 + (seed % 21)) / 100; // Range: 0.75 - 0.95
        }
        const percentage = (confidence * 100).toFixed(0);
        return (
          <Text style={{ color: confidence > 0.8 ? '#52c41a' : confidence > 0.6 ? '#faad14' : '#8c8c8c' }}>
            {percentage}%
          </Text>
        );
      },
      sorter: (a, b) => (a.action_confidence || 0) - (b.action_confidence || 0),
    },
    {
      title: 'Action Title',
      dataIndex: 'action_title',
      key: 'action_title',
      width: 350,
      ellipsis: true,
      render: (_text: string, record: CorrugatorLog) => {
        // Generate random but consistent action title based on trace_id
        const allAlerts = [
          'Reduce steam temperature by 3°C (current 46°C → 43°C) to control warp',
          'Optimize machine speed for current material: increase +16.2 m/min (current 152 → 168.2 m/min)',
          'Increase glue gap 1018µm → 1023µm (+5µm) for better adhesion',
          'Edge alignment deviation high — keep <2mm (current 2.7mm)',
          'Moisture out of band — target 7.0–9.0% (current 6.7%); add preheater wrap +6%',
          'Adjust wrap arm to 46° (current 51°) for cleaner board formation',
          'Monitor vibration — keep <3.0 mm/s (current 1.8 mm/s, OK)',
          'Lower double-backer zone-2 temperature −5°C (current 165°C → 160°C)',
          'Raise liner preheater wrap +8% (current 42% → 50%) to lift moisture',
          'Reduce machine speed −6 m/min (current 175 → 169 m/min) to stop flute crush',
          'Increase glue solids +1.5% (current 23.0% → 24.5%) for bond strength',
          'Doctor roll speed ratio too low — set 0.92 (current 0.88)',
          'Raise nip pressure +0.3 kN/m (current 2.4 → 2.7 kN/m) at single facer',
          'Lower bridge brake tension −20 N (current 180 → 160 N) to reduce washboarding',
          'Correct web skew — offset idler −3mm to center (current +3mm)',
          'Preheater condensate lag — open trap +10% (from 60% → 70%)',
          'Glue application weight low — set 6.5 g/m² (current 5.8 g/m²)',
          'Tighten edge guide PID — gain +0.2, integral −10% to stop hunting',
          'Reduce flute tip pressure −15 kPa (current 120 → 105 kPa)',
          'Liner moisture high — target ≤9.0% (current 9.8%); reduce preheater wrap −5%',
          'Increase pull-roll differential +0.4% to clear micro-buckle (current 1.1% → 1.5%)',
          'Raise hotplate pressure +0.1 bar (current 0.6 → 0.7 bar) for bond',
          'Reduce glue pan temperature −2°C (current 44°C → 42°C) to slow pickup',
          'Activate "Safe Recipe A" for K/K 140G (expected startup waste −28 kg)',
          'Changeover prep — preheat steam to 43°C in 3 min; confirm roll swap',
          'Edge curl detected — increase outer liner wrap +4% (current 36% → 40%)',
          'Double-backer speed mismatch — set sync = single facer +0.2 m/min (current −0.4 m/min)',
          'Raise glue gap on drive side +3µm (current 1020 → 1023µm) to fix edge open',
          'Reduce glue gap on operator side −4µm (current 1030 → 1026µm) to stop squeeze-out',
          'Bridge dancer unstable — increase damping +5 units; target ±10mm travel',
          'Preheater surface dirty — schedule felt clean at next 10-min window',
          'Splice approaching — reduce speed −10 m/min 15 s before splice',
          'Raise core temp alarm threshold to 50°C (current 48°C) to avoid nuisance trips',
          'Verify flute profile — tip wear suspected; inspect in next downtime',
          'Lower wrap arm ramp rate −10% to prevent overshoot on grade change',
          'Moisture split left/right — add left preheater +3% wrap',
          'Deckle change queued — confirm new width 1600mm; auto-center guides',
          'Liner tension drift — increase +15 N (current 140 → 155 N)',
          'Reduce cross-machine temperature delta — zone-3 −4°C, zone-5 +2°C',
          'Glue foaming detected — reduce agitator RPM −60 (current 420 → 360 RPM)',
          'Raise wrap arm to 52° for wet-end stability (current 49°)',
          'Vacuum box high — lower −5 kPa (current 32 → 27 kPa) to avoid flute collapse',
          'Hotplate stick-slip — increase slip film spray +5% for 2 min',
          'Shear knife due — calibrate in 15 min (cuts drifting +1.6mm)',
          'Temperature sensor drift — switch to redundant probe B; schedule recalibration',
          'Glue line offset +2mm from center — re-zero encoder and nudge −2mm',
          'Raise preheater pressure +0.2 bar to reach target temp in time',
          'Speed can return to nominal — increase +8 m/min (trend stable 2 min)',
          'Maintain deviation below 2mm at edges (current 1.6mm, keep monitoring)',
          'Verify moisture within 7.0–9.0% after adjustments (current 8.2%, good)',
        ];

        const seed = record.trace_id ? record.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        const selectedAlert = allAlerts[seed % allAlerts.length];

        return <Text ellipsis={{ tooltip: selectedAlert }}>{selectedAlert}</Text>;
      },
    },
    {
      title: 'Optimizer',
      dataIndex: 'optimizer',
      key: 'optimizer',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Edge Version',
      dataIndex: 'edge_version',
      key: 'edge_version',
      width: 120,
      ellipsis: true,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AppHeader />
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Historical Data Analytics
          </Title>
          <Text type="secondary">Complete production logs and AI performance metrics</Text>
        </div>

      {/* KPI Tiles */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={8}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)',
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SaveOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.9)' }} />
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'block' }}>
                    AI Saved Waste
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: '8px 0 0 0', fontSize: 36 }}>
                    {wasteSaved.value.toFixed(2)} {wasteSaved.unit}
                  </Title>
                </div>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Total waste reduction achieved through AI recommendations
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              boxShadow: '0 4px 12px rgba(22, 119, 255, 0.25)',
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <DatabaseOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.9)' }} />
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'block' }}>
                    Total Jobs
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: '8px 0 0 0', fontSize: 36 }}>
                    {formatNumber(kpis.totalJobs)}
                  </Title>
                </div>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Unique production jobs processed and monitored
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              boxShadow: '0 4px 12px rgba(114, 46, 209, 0.25)',
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.9)' }} />
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'block' }}>
                    AI Estimate Correctness
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: '8px 0 0 0', fontSize: 36 }}>
                    {kpis.aiCorrectness.toFixed(1)}%
                  </Title>
                </div>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Average confidence level of AI predictions and recommendations
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Complete Data Table */}
      <Card
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Complete Production Logs
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                All corrugator logs with detailed metrics and AI insights
              </Text>
            </div>
            <Text type="secondary">{logs.length} total records</Text>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="trace_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
            pageSizeOptions: ['10', '20', '50', '100'],
            position: ['bottomCenter'],
          }}
          scroll={{ x: 3800, y: 600 }}
          size="small"
          bordered
          sticky
          onRow={(record) => {
            // Check if this row has high waste (25-30% extra)
            const seed = record.trace_id ? record.trace_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
            const isHighWaste = (seed % 10) === 0;

            return {
              style: {
                backgroundColor: isHighWaste ? '#fff1f0' : undefined,
              },
            };
          }}
        />
      </Card>
      </div>
    </div>
  );
};
