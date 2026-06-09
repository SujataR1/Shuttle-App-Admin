// pages/admin/devices/DeviceSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  message,
  Typography,
  Alert,
  Space,
  Spin,
  Divider,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  InfoCircleOutlined, 
  SettingOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';

const { Title, Text, Paragraph } = Typography;

const API_BASE = "https://be.shuttleapp.transev.site";

const DeviceSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Check device type and get sidebar state from localStorage
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Get sidebar state from localStorage (set by Sidebar component)
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    
    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for sidebar state changes
    const interval = setInterval(() => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate sidebar width based on state (matches your Sidebar component)
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return sidebarOpen ? 288 : 96;
  };

  const sidebarWidth = getSidebarWidth();

  const getAuthToken = () => localStorage.getItem("access_token");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE}/admin/device-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      form.setFieldsValue({
        driver_max_active_sessions: response.data.driver_max_active_sessions
      });
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        setTimeout(() => window.location.href = '/admin/login', 1500);
      } else {
        message.error('Failed to load device settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await axios.patch(`${API_BASE}/admin/device-settings`, 
        { driver_max_active_sessions: values.driver_max_active_sessions },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setSettings(response.data);
      message.success('Device settings updated successfully');
    } catch (error) {
      if (error.response?.status === 422) {
        message.error('Invalid value. Minimum value is 1.');
      } else {
        message.error('Failed to update device settings');
      }
    } finally {
      setSaving(false);
    }
  };

  // Navigate to All Devices page
  const goToAllDevices = () => {
    navigate('/admin/devices');
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
        <div 
          className="flex-1 flex flex-col transition-all duration-300 ease-out"
          style={{
            marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
            width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
          }}
        >
          <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <Spin size="large" tip="Loading settings..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <SettingOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Device Settings</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Configure device and session limits</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-8"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={8}>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Current Limit</p>
                          <p className="text-3xl font-bold text-gray-800">{settings?.driver_max_active_sessions || 2}</p>
                          <p className="text-xs text-gray-400 mt-1">max devices per driver</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <UserOutlined className="text-2xl text-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                          <p className="text-3xl font-bold text-green-600">Active</p>
                          <p className="text-xs text-gray-400 mt-1">enforcement enabled</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                          <CheckCircleOutlined className="text-2xl text-green-500" />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Security Level</p>
                          <p className="text-3xl font-bold text-white">High</p>
                          <p className="text-xs text-white/60 mt-1">device management active</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <SafetyOutlined className="text-2xl text-white" />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </motion.div>

              {/* Main Settings Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ThunderboltOutlined className="text-indigo-500 text-lg" />
                      <span className="font-semibold text-gray-800">Driver Device Limit Configuration</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Info Alert with Clickable Link */}
                    <Alert
                      message="Important Note"
                      description={
                        <div className="text-sm">
                          This limit applies to <strong className="text-indigo-600">future driver login attempts only</strong>. 
                          Existing active logins are <strong>not automatically removed</strong> when the limit is lowered. 
                          You can manually remove existing sessions from the 
                          <Button type="link" className="p-0 ml-1" onClick={goToAllDevices}>
                            Device Management page
                          </Button>.
                        </div>
                      }
                      type="info"
                      showIcon
                      icon={<InfoCircleOutlined />}
                      className="mb-6 rounded-xl"
                    />

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSave}
                      initialValues={{ driver_max_active_sessions: 2 }}
                    >
                      <div className="max-w-md">
                        <Form.Item
                          label={
                            <span className="text-gray-700 font-medium">
                              Maximum Active Driver Logins
                            </span>
                          }
                          name="driver_max_active_sessions"
                          rules={[
                            { required: true, message: 'Please enter the maximum number' },
                            { type: 'number', min: 1, message: 'Minimum value is 1' }
                          ]}
                          tooltip="Maximum number of simultaneous active logins/devices allowed for drivers"
                        >
                          <InputNumber
                            min={1}
                            max={100}
                            className="w-full"
                            size="large"
                            placeholder="Enter limit (minimum 1)"
                            prefix={<UserOutlined className="text-gray-400" />}
                          />
                        </Form.Item>

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={saving}
                            size="large"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-md"
                          >
                            Save Changes
                          </Button>
                          <Button onClick={() => form.resetFields()} size="large">
                            Reset
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </motion.div>

              {/* Current Configuration Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Current Configuration</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Driver Device Limit</p>
                        <p className="text-4xl font-bold text-indigo-600">
                          {settings?.driver_max_active_sessions || 2}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          simultaneous active logins allowed per driver
                        </p>
                      </div>
                      <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Last Updated</p>
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-gray-400" />
                          <span className="text-gray-700">
                            {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Not available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* How It Works Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-6"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <SafetyOutlined className="text-indigo-500 text-lg" />
                    <h3 className="font-semibold text-gray-800">How Device Limits Work</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-indigo-600 text-xs font-bold">1</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Driver attempts login from new device → System checks current active login count
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-indigo-600 text-xs font-bold">2</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        If count exceeds limit → Oldest login session automatically terminated
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-indigo-600 text-xs font-bold">3</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Admins can manually remove any active session from Device Management page
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-indigo-600 text-xs font-bold">4</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Setting applies to all drivers system-wide and takes effect immediately
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;