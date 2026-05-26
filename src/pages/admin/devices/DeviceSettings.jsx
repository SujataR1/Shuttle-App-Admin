// // pages/admin/devices/DeviceSettings.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Card,
//   Form,
//   InputNumber,
//   Button,
//   message,
//   Typography,
//   Alert,
//   Space,
//   Spin,
//   Divider,
//   Statistic,
//   Row,
//   Col
// } from 'antd';
// import { 
//   SaveOutlined, 
//   InfoCircleOutlined, 
//   SettingOutlined,
//   SafetyOutlined,
//   ThunderboltOutlined,
//   UserOutlined,
//   ClockCircleOutlined,
//   CheckCircleOutlined
// } from '@ant-design/icons';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';

// const { Title, Text, Paragraph } = Typography;

// const API_BASE = "https://be.shuttleapp.transev.site";

// const DeviceSettings = () => {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [settings, setSettings] = useState(null);

//   const getAuthToken = () => localStorage.getItem("access_token");

//   const fetchSettings = async () => {
//     setLoading(true);
//     try {
//       const token = getAuthToken();
//       const response = await axios.get(`${API_BASE}/admin/device-settings`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSettings(response.data);
//       form.setFieldsValue({
//         driver_max_active_sessions: response.data.driver_max_active_sessions
//       });
//     } catch (error) {
//       if (error.response?.status === 401) {
//         message.error('Session expired. Please login again.');
//         setTimeout(() => window.location.href = '/admin/login', 1500);
//       } else {
//         message.error('Failed to load device settings');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async (values) => {
//     setSaving(true);
//     try {
//       const token = getAuthToken();
//       const response = await axios.patch(`${API_BASE}/admin/device-settings`, 
//         { driver_max_active_sessions: values.driver_max_active_sessions },
//         { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//       );
//       setSettings(response.data);
//       message.success('Device settings updated successfully');
//     } catch (error) {
//       if (error.response?.status === 422) {
//         message.error('Invalid value. Minimum value is 1.');
//       } else {
//         message.error('Failed to update device settings');
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Navigate to All Devices page
//   const goToAllDevices = () => {
//     navigate('/admin/devices');
//   };

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <div className="flex-1 flex flex-col">
//           <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <div className="flex-1 flex items-center justify-center">
//             <Spin size="large" tip="Loading settings..." />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6 lg:p-8">
//             <div className="max-w-5xl mx-auto">
//               {/* Header */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//                 className="mb-8"
//               >
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
//                     <SettingOutlined className="text-2xl text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-800">Device Settings</h1>
//                     <p className="text-gray-500 text-sm mt-0.5">Configure device and session limits</p>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Stats Cards */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: 0.1 }}
//                 className="mb-8"
//               >
//                 <Row gutter={16}>
//                   <Col xs={24} sm={12} lg={8}>
//                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Current Limit</p>
//                           <p className="text-3xl font-bold text-gray-800">{settings?.driver_max_active_sessions || 2}</p>
//                           <p className="text-xs text-gray-400 mt-1">max devices per driver</p>
//                         </div>
//                         <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
//                           <UserOutlined className="text-2xl text-indigo-500" />
//                         </div>
//                       </div>
//                     </div>
//                   </Col>
//                   <Col xs={24} sm={12} lg={8}>
//                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
//                           <p className="text-3xl font-bold text-green-600">Active</p>
//                           <p className="text-xs text-gray-400 mt-1">enforcement enabled</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
//                           <CheckCircleOutlined className="text-2xl text-green-500" />
//                         </div>
//                       </div>
//                     </div>
//                   </Col>
//                   <Col xs={24} sm={12} lg={8}>
//                     <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Security Level</p>
//                           <p className="text-3xl font-bold text-white">High</p>
//                           <p className="text-xs text-white/60 mt-1">device management active</p>
//                         </div>
//                         <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                           <SafetyOutlined className="text-2xl text-white" />
//                         </div>
//                       </div>
//                     </div>
//                   </Col>
//                 </Row>
//               </motion.div>

//               {/* Main Settings Card */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: 0.2 }}
//               >
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                   <div className="px-6 py-5 border-b border-gray-100">
//                     <div className="flex items-center gap-2">
//                       <ThunderboltOutlined className="text-indigo-500 text-lg" />
//                       <span className="font-semibold text-gray-800">Driver Device Limit Configuration</span>
//                     </div>
//                   </div>
                  
//                   <div className="p-6">
//                     {/* Info Alert with Clickable Link */}
//                     <Alert
//                       message="Important Note"
//                       description={
//                         <div className="text-sm">
//                           This limit applies to <strong className="text-indigo-600">future driver login attempts only</strong>. 
//                           Existing active logins are <strong>not automatically removed</strong> when the limit is lowered. 
//                           You can manually remove existing sessions from the Device Management page.
//                           .
//                         </div>
//                       }
//                       type="info"
//                       showIcon
//                       icon={<InfoCircleOutlined />}
//                       className="mb-6 rounded-xl"
//                     />

//                     <Form
//                       form={form}
//                       layout="vertical"
//                       onFinish={handleSave}
//                       initialValues={{ driver_max_active_sessions: 2 }}
//                     >
//                       <div className="max-w-md">
//                         <Form.Item
//                           label={
//                             <span className="text-gray-700 font-medium">
//                               Maximum Active Driver Logins
//                             </span>
//                           }
//                           name="driver_max_active_sessions"
//                           rules={[
//                             { required: true, message: 'Please enter the maximum number' },
//                             { type: 'number', min: 1, message: 'Minimum value is 1' }
//                           ]}
//                           tooltip="Maximum number of simultaneous active logins/devices allowed for drivers"
//                         >
//                           <InputNumber
//                             min={1}
//                             max={100}
//                             className="w-full"
//                             size="large"
//                             placeholder="Enter limit (minimum 1)"
//                             prefix={<UserOutlined className="text-gray-400" />}
//                           />
//                         </Form.Item>

//                         <div className="flex gap-3 mt-6">
//                           <Button
//                             type="primary"
//                             htmlType="submit"
//                             icon={<SaveOutlined />}
//                             loading={saving}
//                             size="large"
//                             className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-md"
//                           >
//                             Save Changes
//                           </Button>
//                           <Button onClick={() => form.resetFields()} size="large">
//                             Reset
//                           </Button>
//                         </div>
//                       </div>
//                     </Form>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Current Configuration Card */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: 0.3 }}
//                 className="mt-6"
//               >
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                   <div className="px-6 py-4 border-b border-gray-100">
//                     <h3 className="font-semibold text-gray-800">Current Configuration</h3>
//                   </div>
//                   <div className="p-6">
//                     <div className="flex items-center justify-between flex-wrap gap-4">
//                       <div>
//                         <p className="text-gray-500 text-sm mb-1">Driver Device Limit</p>
//                         <p className="text-4xl font-bold text-indigo-600">
//                           {settings?.driver_max_active_sessions || 2}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-2">
//                           simultaneous active logins allowed per driver
//                         </p>
//                       </div>
//                       <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
//                       <div>
//                         <p className="text-gray-500 text-sm mb-1">Last Updated</p>
//                         <div className="flex items-center gap-2">
//                           <ClockCircleOutlined className="text-gray-400" />
//                           <span className="text-gray-700">
//                             {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Not available'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* How It Works Card */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: 0.4 }}
//                 className="mt-6"
//               >
//                 <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-4">
//                     <SafetyOutlined className="text-indigo-500 text-lg" />
//                     <h3 className="font-semibold text-gray-800">How Device Limits Work</h3>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="flex items-start gap-3">
//                       <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
//                         <span className="text-indigo-600 text-xs font-bold">1</span>
//                       </div>
//                       <p className="text-gray-600 text-sm">
//                         Driver attempts login from new device → System checks current active login count
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
//                         <span className="text-indigo-600 text-xs font-bold">2</span>
//                       </div>
//                       <p className="text-gray-600 text-sm">
//                         If count exceeds limit → Oldest login session automatically terminated
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
//                         <span className="text-indigo-600 text-xs font-bold">3</span>
//                       </div>
//                       <p className="text-gray-600 text-sm">
//                         Admins can manually remove any active session from Device Management page
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
//                         <span className="text-indigo-600 text-xs font-bold">4</span>
//                       </div>
//                       <p className="text-gray-600 text-sm">
//                         Setting applies to all drivers system-wide and takes effect immediately
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeviceSettings;
// pages/admin/devices/DeviceSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  InputNumber,
  Button,
  message,
  Alert,
  Tag,
  Tooltip,
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  InfoCircleOutlined, 
  SettingOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  MobileOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';

const API_BASE = "https://be.shuttleapp.transev.site";

const DeviceSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [inputValue, setInputValue] = useState(2);

  const getAuthToken = () => localStorage.getItem("access_token");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE}/admin/device-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      const currentValue = response.data.driver_max_active_sessions || 2;
      setInputValue(currentValue);
      form.setFieldsValue({
        driver_max_active_sessions: currentValue
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
      setInputValue(values.driver_max_active_sessions);
      message.success({
        content: 'Device settings updated successfully',
        icon: <CheckCircleOutlined />,
        duration: 3
      });
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

  const handleInputChange = (value) => {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
      setInputValue(1);
      form.setFieldsValue({ driver_max_active_sessions: 1 });
      return;
    }
    
    // Ensure value is a number
    const numValue = Number(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      setInputValue(1);
      form.setFieldsValue({ driver_max_active_sessions: 1 });
      return;
    }
    
    // Only enforce minimum value of 1 (no maximum limit)
    let finalValue = numValue;
    if (numValue < 1) finalValue = 1;
    
    setInputValue(finalValue);
    form.setFieldsValue({ driver_max_active_sessions: finalValue });
  };

  const goToAllDevices = () => {
    navigate('/admin/devices');
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading configuration...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Modern Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <SettingOutlined className="text-2xl text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">Admin Panel</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Device Management</span>
                      </div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                        Device Configuration
                      </h1>
                      <p className="text-slate-500 text-base">
                        Manage driver session limits and device security policies
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={goToAllDevices}
                    className="h-11 px-6 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 rounded-xl font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <MobileOutlined className="text-indigo-500" />
                      <span>View All Devices</span>
                      <ArrowRightOutlined className="text-sm" />
                    </div>
                  </Button>
                </div>
              </motion.div>

              {/* Stats Grid - Modern Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="group"
                >
                  <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <UserOutlined className="text-xl text-white" />
                        </div>
                        <Tag color="blue" className="rounded-full">Active</Tag>
                      </div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Current Limit</p>
                      <p className="text-4xl font-bold text-slate-800 mb-2">
                        {settings?.driver_max_active_sessions?.toLocaleString() || 2}
                      </p>
                      <p className="text-slate-500 text-sm">maximum devices per driver</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="group"
                >
                  <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <SafetyOutlined className="text-xl text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-emerald-600 font-medium">Enforced</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Policy Status</p>
                      <p className="text-3xl font-bold text-slate-800 mb-2">Active</p>
                      <p className="text-slate-500 text-sm">real-time enforcement</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="group"
                >
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <DashboardOutlined className="text-xl text-white" />
                        </div>
                        <div className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                          <span className="text-xs text-white/80 font-mono">Flexible Limit</span>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold">Configuration</p>
                      <p className="text-3xl font-bold text-white mb-2">Unlimited</p>
                      <p className="text-white/60 text-sm">no upper bound restriction</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Configuration Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mb-8"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <ThunderboltOutlined className="text-indigo-600 text-lg" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">Driver Device Limit Configuration</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Set the maximum number of simultaneous logins per driver</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {/* Enhanced Info Alert */}
                    <Alert
                      message={
                        <div className="flex items-center gap-2">
                          <InfoCircleOutlined className="text-indigo-500" />
                          <span className="font-semibold text-slate-800">Important Configuration Notes</span>
                        </div>
                      }
                      description={
                        <div className="mt-2 space-y-2">
                          <p className="text-slate-600">
                            This limit applies to <strong className="text-indigo-600">future driver login attempts only</strong>. 
                            Existing active logins are <strong className="text-amber-600">not automatically removed</strong> when the limit is lowered.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm text-slate-500">
                              You can manually remove existing sessions from the 
                              <Button type="link" onClick={goToAllDevices} className="p-0 mx-1 h-auto text-indigo-600">
                                Device Management page
                              </Button>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm text-slate-500">
                              <strong>No upper limit restriction</strong> — You can set any positive integer value
                            </span>
                          </div>
                        </div>
                      }
                      type="info"
                      showIcon={false}
                      className="mb-8 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"
                    />

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSave}
                      initialValues={{ driver_max_active_sessions: 2 }}
                    >
                      <div className="max-w-lg">
                        <Form.Item
                          label={
                            <div className="flex items-center gap-2 mb-2">
                              <UserOutlined className="text-indigo-500" />
                              <span className="font-semibold text-slate-700">Maximum Active Driver Logins</span>
                              <Tooltip title="Maximum number of simultaneous active logins/devices allowed for drivers (minimum 1, no maximum limit)">
                                <InfoCircleOutlined className="text-slate-400 cursor-help text-sm" />
                              </Tooltip>
                            </div>
                          }
                          name="driver_max_active_sessions"
                          rules={[
                            { required: true, message: 'Please enter the maximum number' },
                            { 
                              validator: async (_, value) => {
                                if (value === undefined || value === null || value === '') {
                                  throw new Error('Please enter a positive integer');
                                }
                                const numValue = Number(value);
                                if (isNaN(numValue)) {
                                  throw new Error('Please enter a valid number');
                                }
                                if (!Number.isInteger(numValue)) {
                                  throw new Error('Please enter a whole number (integer)');
                                }
                                if (numValue < 1) {
                                  throw new Error('Minimum value is 1');
                                }
                                // No maximum limit check!
                              }
                            }
                          ]}
                        >
                          <div className="relative">
                            <InputNumber
                              min={1}
                              value={inputValue}
                              onChange={handleInputChange}
                              className="w-full"
                              size="large"
                              placeholder="Enter limit (minimum 1)"
                              style={{ 
                                borderRadius: '12px',
                                borderColor: '#e2e8f0',
                                padding: '8px 12px',
                                width: '100%'
                              }}
                              step={1}
                              precision={0}
                              parser={(value) => {
                                // Parse the value as integer
                                const parsed = parseInt(value, 10);
                                return isNaN(parsed) ? '' : parsed;
                              }}
                              formatter={(value) => {
                                // Format the value for display with thousand separators
                                if (!value && value !== 0) return '';
                                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                              }}
                            />
                            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                              devices
                            </div>
                          </div>
                        </Form.Item>

                        {/* Quick selection buttons */}
                        <div className="mt-4 mb-6">
                          <p className="text-xs text-slate-500 mb-2">Quick select:</p>
                          <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3, 5, 10, 25, 50, 100].map(num => (
                              <Button
                                key={num}
                                size="small"
                                onClick={() => {
                                  setInputValue(num);
                                  form.setFieldsValue({ driver_max_active_sessions: num });
                                }}
                                className={`rounded-lg text-sm ${inputValue === num ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200'}`}
                              >
                                {num.toLocaleString()}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom limit hint */}
                        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-600">
                            💡 <span className="font-medium">No upper limit:</span> You can set any positive integer value (1, 2, 3, 100, 1000, 100000, etc.)
                          </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={saving}
                            size="large"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-8"
                          >
                            Save Configuration
                          </Button>
                          <Button 
                            onClick={() => {
                              const originalValue = settings?.driver_max_active_sessions || 2;
                              setInputValue(originalValue);
                              form.setFieldsValue({ driver_max_active_sessions: originalValue });
                            }} 
                            size="large"
                            className="rounded-xl border-slate-200 hover:border-slate-300"
                          >
                            Reset Changes
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </motion.div>

              {/* Current Configuration and Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Current Configuration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-full">
                    <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <HistoryOutlined className="text-indigo-500 text-lg" />
                        <h3 className="font-semibold text-slate-800">Current Configuration</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <p className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                            <UserOutlined />
                            Driver Device Limit
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {settings?.driver_max_active_sessions?.toLocaleString() || 2}
                            </span>
                            <span className="text-slate-400">devices</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-3">
                            simultaneous active logins allowed per driver
                          </p>
                        </div>
                        
                        <Divider className="my-2" />
                        
                        <div>
                          <p className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                            <ClockCircleOutlined />
                            Last Updated
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-slate-700 font-mono text-sm">
                                {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Not available'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden h-full">
                    <div className="px-6 py-5 bg-white/50 backdrop-blur-sm border-b border-indigo-100">
                      <div className="flex items-center gap-2">
                        <SafetyOutlined className="text-indigo-600 text-lg" />
                        <h3 className="font-semibold text-slate-800">How Device Limits Work</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4 group">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 mb-1">Login Attempt</p>
                            <p className="text-slate-500 text-sm">Driver attempts login from new device → System checks current active login count</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 group">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 mb-1">Limit Validation</p>
                            <p className="text-slate-500 text-sm">If count would exceed limit → Oldest login session is automatically terminated</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 group">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 mb-1">Manual Management</p>
                            <p className="text-slate-500 text-sm">Admins can manually remove any active session from Device Management page</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 group">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xs font-bold">4</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 mb-1">Global Application</p>
                            <p className="text-slate-500 text-sm">Setting applies to all drivers system-wide and takes effect immediately</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Additional Security Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ExclamationCircleOutlined className="text-amber-600 text-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Configuration Flexibility</h4>
                      <p className="text-slate-500 text-sm">
                        You can set any positive integer value based on your organization's needs. 
                        While there's no technical upper limit, consider security best practices when setting high values. 
                        For most organizations, a limit between 2-5 devices provides optimal security without impacting productivity.
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