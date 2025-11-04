import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Descriptions,
  Space,
  Typography,
  Tag,
  Divider,
  Row,
  Col,
  Card,
  Statistic,
  Form,
  InputNumber,
  Select,
  Button,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  EditOutlined,
  SaveOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { CurrentJob } from '../../types';
import { apiService } from '../../services/api.service';
import type { UpdateJobRequest } from '../../types/api.types';
import { useLoading } from '../../contexts/LoadingContext';

const { Title, Text } = Typography;

interface JobDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  job: CurrentJob | null;
  onJobUpdated?: () => void;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({
  open,
  onClose,
  job,
  onJobUpdated
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showLoader, hideLoader, updateProgress } = useLoading();

  const isPaused = job?.eventType === 'paused';

  // Reset form when job changes
  useEffect(() => {
    if (job && isEditing) {
      form.setFieldsValue({
        quantity: job.quantity,
        flute: job.flute,
        gsm: parseFloat(job.paperGrade.split('-')[1]?.trim()) || 0,
        length: parseFloat(job.thickness) || 0,
        width: 100, // Default, not available in CurrentJob
        printing: 1, // Default
        shift: 'Day', // Default
        experience: 'High', // Default
      });
    }
  }, [job, isEditing, form]);

  if (!job) return null;

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'in-progress': 'processing',
      paused: 'warning',
      completed: 'success',
      pending: 'default',
    };
    return colors[eventType] || 'default';
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      quantity: job.quantity,
      flute: job.flute,
      gsm: parseFloat(job.paperGrade.split('-')[1]?.trim()) || 0,
      length: parseFloat(job.thickness) || 0,
      width: 100,
      printing: 1,
      shift: 'Day',
      experience: 'High',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const updateData: UpdateJobRequest = {
        length: values.length,
        width: values.width,
        gsm: values.gsm,
        printing: values.printing,
        quantity: values.quantity,
        flute: values.flute,
        shift: values.shift,
        experience: values.experience,
        status: job.eventType as 'in-progress' | 'paused'
      };

      const response = await apiService.updateJob(job.jobId, updateData);

      if (response.success) {
        message.success('Job updated successfully!');
        setIsEditing(false);
        if (onJobUpdated) {
          onJobUpdated();
        }
      } else {
        message.error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      message.error('Failed to update job');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePauseResume = async () => {
    if (!job) return;

    const newStatus = isPaused ? 'in-progress' : 'paused';
    const actionText = isPaused ? 'Resuming' : 'Pausing';

    // Show loader with initial message
    showLoader(`${actionText} Job ${job.jobId}...`);

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      if (progress <= 90) {
        updateProgress(progress);
      }
    }, 50); // Update every 50ms for smooth animation

    try {
      const updateData: UpdateJobRequest = {
        length: parseFloat(job.thickness) || 0,
        width: 100,
        gsm: parseFloat(job.paperGrade.split('-')[1]?.trim()) || 0,
        printing: 1,
        quantity: job.quantity,
        flute: job.flute,
        shift: 'Day',
        experience: 'High',
        status: newStatus
      };

      const response = await apiService.updateJob(job.jobId, updateData);

      // Complete the progress
      clearInterval(progressInterval);
      updateProgress(100);

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));

      if (response.success) {
        message.success(isPaused ? 'Job resumed successfully!' : 'Job paused successfully!');
        if (onJobUpdated) {
          onJobUpdated();
        }
        onClose();
      } else {
        message.error(`Failed to ${isPaused ? 'resume' : 'pause'} job`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error pausing/resuming job:', error);
      message.error(`Failed to ${isPaused ? 'resume' : 'pause'} job`);
    } finally {
      hideLoader();
    }
  };

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Job Details {isPaused && '(Paused - Editable)'}
          </Text>
          <Title level={4} style={{ margin: 0 }}>
            {job.jobId}
          </Title>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          {!isEditing && isPaused && (
            <Button
              icon={<EditOutlined />}
              onClick={handleEdit}
              type="primary"
            >
              Edit Job
            </Button>
          )}
          <Button
            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={handlePauseResume}
            danger={!isPaused}
            type={isPaused ? 'primary' : 'default'}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Job Status */}
        <Card bordered={false} style={{ background: '#fafafa' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Status"
                value={job.eventType.toUpperCase()}
                valueStyle={{ fontSize: 18 }}
                prefix={<Tag color={getEventTypeColor(job.eventType)}></Tag>}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Completion"
                value={job.completion.toFixed(2)}
                suffix="%"
                valueStyle={{ fontSize: 18, color: '#1677ff' }}
              />
            </Col>
          </Row>
        </Card>

        {isEditing ? (
          /* Editable Form */
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Title level={5}>Edit Job Details</Title>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[{ required: true, message: 'Please input quantity!' }]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="Enter quantity"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Flute Type"
                  name="flute"
                  rules={[{ required: true, message: 'Please select flute!' }]}
                >
                  <Select placeholder="Select flute">
                    <Select.Option value="A">A</Select.Option>
                    <Select.Option value="B">B</Select.Option>
                    <Select.Option value="C">C</Select.Option>
                    <Select.Option value="E">E</Select.Option>
                    <Select.Option value="F">F</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="GSM"
                  name="gsm"
                  rules={[{ required: true, message: 'Please input GSM!' }]}
                >
                  <InputNumber
                    min={1}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="Enter GSM"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Length (mm)"
                  name="length"
                  rules={[{ required: true, message: 'Please input length!' }]}
                >
                  <InputNumber
                    min={1}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="Enter length"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Width (mm)"
                  name="width"
                  rules={[{ required: true, message: 'Please input width!' }]}
                >
                  <InputNumber
                    min={1}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="Enter width"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Printing"
                  name="printing"
                  rules={[{ required: true, message: 'Please select printing!' }]}
                >
                  <Select placeholder="Select printing">
                    <Select.Option value={0}>No</Select.Option>
                    <Select.Option value={1}>Yes</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Shift"
                  name="shift"
                  rules={[{ required: true, message: 'Please select shift!' }]}
                >
                  <Select placeholder="Select shift">
                    <Select.Option value="Day">Day</Select.Option>
                    <Select.Option value="Night">Night</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Experience"
                  name="experience"
                  rules={[{ required: true, message: 'Please select experience!' }]}
                >
                  <Select placeholder="Select experience">
                    <Select.Option value="Low">Low</Select.Option>
                    <Select.Option value="Medium">Medium</Select.Option>
                    <Select.Option value="High">High</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={12}>
                <Button block onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isSaving}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        ) : (
          /* Read-Only View */
          <>
            <div>
              <Title level={5}>Job Information</Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Job ID">{job.jobId}</Descriptions.Item>
                <Descriptions.Item label="Job Name">{job.jobName}</Descriptions.Item>
                <Descriptions.Item label="Quantity">
                  <Tag color="blue">{job.quantity} units</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Paper Grade">
                  <Tag color="green">{job.paperGrade}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Flute Type">
                  <Tag color="purple">{job.flute}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thickness">{job.thickness}</Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <div>
              <Title level={5}>
                <ThunderboltOutlined /> Machine Settings
              </Title>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Speed">
                  {job.speed.toFixed(1)} m/min
                </Descriptions.Item>
                <Descriptions.Item label="Steam Temp">
                  {job.steam.toFixed(1)}°C
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <div>
              <Title level={5}>
                <WarningOutlined /> Waste Predictions
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Card bordered={false} style={{ background: '#e6f7ff' }}>
                    <Statistic
                      title="Setup Waste"
                      value={job.predictedSetupWaste.toFixed(2)}
                      suffix="kg"
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<ExperimentOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card bordered={false} style={{ background: '#fffbe6' }}>
                    <Statistic
                      title="Dry End Waste"
                      value={job.predictedDryEndWaste.toFixed(2)}
                      suffix="kg"
                      valueStyle={{ color: '#faad14' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            <Divider />

            <div>
              <Title level={5}>AI Recommendations</Title>
              <Card>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div>
                    <Tag color={job.actionConfidence > 0.8 ? 'success' : 'warning'}>
                      {(job.actionConfidence * 100).toFixed(0)}% Confidence
                    </Tag>
                    <Text strong> {job.actionTitle}</Text>
                  </div>
                  {job.actionSteps.map((step, index) => (
                    <div key={index} style={{ paddingLeft: 16 }}>
                      <Text>• {step.step}</Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </div>
          </>
        )}
      </Space>
    </Drawer>
  );
};
