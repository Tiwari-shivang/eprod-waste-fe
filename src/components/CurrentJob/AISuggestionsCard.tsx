import React, { useState, useEffect, memo } from 'react';
import { Card, Typography, List, Space, Tag, Checkbox, Button, message } from 'antd';
import { BulbOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { CurrentJob } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface AISuggestionsCardProps {
  job: CurrentJob;
  onApplySettings?: (jobId: string) => void;
}

const AISuggestionsCardComponent: React.FC<AISuggestionsCardProps> = ({
  job,
  onApplySettings
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isApplying, setIsApplying] = useState(false);

  // Initialize checkboxes based on whether settings are already applied
  useEffect(() => {
    if (job.appliedSettings) {
      // If settings already applied, check all boxes
      const allChecked: Record<number, boolean> = {};
      job.actionSteps?.forEach((_, index) => {
        allChecked[index] = true;
      });
      setCheckedSteps(allChecked);
    } else {
      // Reset checkboxes
      setCheckedSteps({});
    }
  }, [job.appliedSettings, job.actionSteps]);

  const formatSuggestion = (step: any): string => {
    let suggestion = step.step || 'No step description';

    // Check for valid delta_c (not NaN, not undefined, not 0)
    if (step.delta_c !== undefined && !isNaN(step.delta_c) && Math.abs(step.delta_c) > 0.1) {
      const direction = step.delta_c > 0 ? 'increase' : 'decrease';
      suggestion += ` (${direction} by ${Math.abs(step.delta_c).toFixed(1)}°C)`;
    }

    // Check for valid delta_mpm (not NaN, not undefined, not 0)
    if (step.delta_mpm !== undefined && !isNaN(step.delta_mpm) && Math.abs(step.delta_mpm) > 0.1) {
      const direction = step.delta_mpm > 0 ? 'increase' : 'decrease';
      suggestion += ` (${direction} by ${Math.abs(step.delta_mpm).toFixed(1)} m/min)`;
    }

    return suggestion;
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: checked
    }));
  };

  const allStepsChecked = job.actionSteps?.every((_, index) => checkedSteps[index]) ?? false;

  const handleApplySettings = async () => {
    setIsApplying(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the callback to update the job
      if (onApplySettings) {
        onApplySettings(job.jobId);
      }

      message.success({
        content: 'AI settings applied successfully! Waste risk reduced to optimal range.',
        duration: 3,
      });
    } catch (error) {
      message.error('Failed to apply settings. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        height: '100%',
        background: job.appliedSettings
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green gradient for applied
          : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', // Blue gradient for pending
        boxShadow: job.appliedSettings
          ? '0 4px 12px rgba(16, 185, 129, 0.25)'
          : '0 4px 12px rgba(37, 99, 235, 0.25)'
      }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          {job.appliedSettings ? (
            <ThunderboltOutlined style={{ fontSize: 40, color: '#fff', marginBottom: 12 }} />
          ) : (
            <BulbOutlined style={{ fontSize: 40, color: '#fff', marginBottom: 12 }} />
          )}
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {job.appliedSettings ? 'Settings Applied' : 'AI Suggestions'}
          </Title>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            {job.appliedSettings
              ? 'Optimized for Minimal Waste'
              : 'Minimize Waste with AI Insights'
            }
          </Text>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
          backdropFilter: 'blur(10px)'
        }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong style={{ color: '#fff', fontSize: 13 }}>
                Recommendation
              </Text>
              <Tag
                color={job.actionConfidence > 0.8 ? 'success' : job.actionConfidence > 0.6 ? 'warning' : 'default'}
                style={{ margin: 0 }}
              >
                {(job.actionConfidence * 100).toFixed(0)}% Confidence
              </Tag>
            </div>
            <Paragraph style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: 12 }}>
              {job.actionTitle}
            </Paragraph>
          </Space>
        </div>

        {job.actionSteps && job.actionSteps.length > 0 && (
          <div style={{
            padding: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 8,
            maxHeight: 300,
            overflowY: 'auto'
          }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12, color: '#1f1f1f' }}>
              Action Steps:
            </Text>
            <List
              size="small"
              dataSource={job.actionSteps}
              renderItem={(step, index) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <Space align="start" size={8} style={{ width: '100%' }}>
                    <Checkbox
                      checked={checkedSteps[index] || false}
                      onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                      disabled={job.appliedSettings}
                      style={{ marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#1f1f1f',
                          textDecoration: checkedSteps[index] ? 'line-through' : 'none',
                          opacity: checkedSteps[index] ? 0.6 : 1
                        }}
                      >
                        {formatSuggestion(step)}
                      </Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />

            {!job.appliedSettings && (
              <Button
                type="primary"
                block
                size="large"
                disabled={!allStepsChecked}
                loading={isApplying}
                onClick={handleApplySettings}
                icon={<ThunderboltOutlined />}
                style={{
                  marginTop: 16,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  background: allStepsChecked
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : undefined,
                  border: 'none',
                }}
              >
                Apply Settings
              </Button>
            )}

            {job.appliedSettings && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 6,
                textAlign: 'center'
              }}>
                <Text style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>
                  ✓ All settings have been applied successfully
                </Text>
              </div>
            )}
          </div>
        )}

        <div style={{
          padding: 12,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
          textAlign: 'center'
        }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
            {job.appliedSettings
              ? 'AI-optimized settings are now active for this job'
              : 'Check all steps and apply settings to optimize production'
            }
          </Text>
        </div>
      </Space>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render when job.jobId, job.appliedSettings, or job.actionSteps change
export const AISuggestionsCard = memo(AISuggestionsCardComponent, (prevProps, nextProps) => {
  // Return true if props are equal (don't re-render)
  // Return false if props are different (re-render)
  return (
    prevProps.job.jobId === nextProps.job.jobId &&
    prevProps.job.appliedSettings === nextProps.job.appliedSettings &&
    prevProps.job.actionConfidence === nextProps.job.actionConfidence &&
    prevProps.job.actionTitle === nextProps.job.actionTitle &&
    JSON.stringify(prevProps.job.actionSteps) === JSON.stringify(nextProps.job.actionSteps) &&
    prevProps.onApplySettings === nextProps.onApplySettings
  );
});
