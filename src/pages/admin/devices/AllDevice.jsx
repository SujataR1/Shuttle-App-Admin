// // pages/admin/devices/AllDevice.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   Card,
//   Badge,
//   Button,
//   Space,
//   Select,
//   message,
//   Tag,
//   Typography,
//   Tooltip,
//   Drawer,
//   Popconfirm,
//   Spin,
//   Alert,
//   Statistic,
//   Row,
//   Col,
//   Avatar
// } from 'antd';
// import {
//   MobileOutlined,
//   DesktopOutlined,
//   TabletOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   DeleteFilled,
//   ReloadOutlined,
//   DashboardOutlined,
//   UserOutlined,
//   LaptopOutlined,
//   WarningOutlined,
//   CheckCircleOutlined,
//   AppleOutlined,
//   AndroidOutlined,
//   WindowsOutlined
// } from '@ant-design/icons';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import duration from 'dayjs/plugin/duration';
// import { motion } from 'framer-motion';
// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';

// dayjs.extend(relativeTime);
// dayjs.extend(duration);

// const { Title, Text } = Typography;
// const { Option } = Select;

// // API Base URL
// const API_BASE = "https://be.shuttleapp.transev.site";

// const AllDevice = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 25,
//     total: 0
//   });
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userDevices, setUserDevices] = useState([]);
//   const [devicesLoading, setDevicesLoading] = useState(false);
//   const [statistics, setStatistics] = useState({
//     totalUsers: 0,
//     totalActiveLogins: 0,
//     totalDevices: 0,
//     criticalCount: 0
//   });

//   const getAuthToken = () => localStorage.getItem("access_token");

//   // Function to get full profile picture URL
//   const getProfilePictureUrl = (profilePicturePath) => {
//     if (!profilePicturePath) return null;
//     // If it's already a full URL, return as is
//     if (profilePicturePath.startsWith('http')) return profilePicturePath;
//     // Otherwise, prepend the API base URL
//     return `${API_BASE}${profilePicturePath}`;
//   };

//   // Calculate statistics from users data
//   const calculateStatistics = (usersData) => {
//     const totalActiveLogins = usersData.reduce((sum, user) => sum + (user.active_login_count || 0), 0);
//     const totalDevices = totalActiveLogins;
//     const criticalCount = usersData.filter(user => (user.active_login_count || 0) >= 5).length;
    
//     setStatistics({
//       totalUsers: usersData.length,
//       totalActiveLogins,
//       totalDevices,
//       criticalCount
//     });
//   };

//   const fetchUsers = async (page = 1, pageSize = 25, role = null) => {
//     setLoading(true);
//     setError(null);
    
//     const token = getAuthToken();
//     if (!token) {
//       setError("No authentication token found. Please login.");
//       setLoading(false);
//       message.error("Please login again");
//       setTimeout(() => window.location.href = '/admin/login', 2000);
//       return;
//     }

//     try {
//       const params = { page, page_size: pageSize };
//       if (role && role !== 'all') params.role = role;
      
//       const response = await axios.get(`${API_BASE}/admin/devices`, {
//         params,
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000
//       });
      
//       if (response.data && response.data.items) {
//         setUsers(response.data.items);
//         calculateStatistics(response.data.items);
//         setPagination({
//           current: response.data.pagination?.page || 1,
//           pageSize: response.data.pagination?.page_size || 25,
//           total: response.data.pagination?.total || 0
//         });
//       } else {
//         setUsers([]);
//         setError("Invalid response format");
//       }
//     } catch (error) {
//       console.error("API Error:", error);
      
//       let errorMessage = "Failed to load users";
//       if (error.code === "ECONNABORTED") {
//         errorMessage = "Request timeout. Please check your internet connection.";
//       } else if (error.response?.status === 401) {
//         errorMessage = "Session expired. Please login again.";
//         setTimeout(() => window.location.href = '/admin/login', 2000);
//       } else if (error.response?.status === 403) {
//         errorMessage = "You don't have permission to access this page.";
//       } else if (error.response?.data?.detail?.message) {
//         errorMessage = error.response.data.detail.message;
//       }
      
//       setError(errorMessage);
//       message.error(errorMessage);
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserDevices = async (userId) => {
//     setDevicesLoading(true);
//     const token = getAuthToken();
//     if (!token) {
//       message.error("Please login again");
//       setDevicesLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.get(`${API_BASE}/admin/users/${userId}/devices`, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000
//       });
      
//       setUserDevices(response.data.devices || []);
//     } catch (error) {
//       console.error("Failed to load devices:", error);
//       message.error(error.response?.data?.detail?.message || "Failed to load devices");
//       setUserDevices([]);
//     } finally {
//       setDevicesLoading(false);
//     }
//   };

//   const handleRemoveDevice = async (userId, sessionId) => {
//     const token = getAuthToken();
//     if (!token) {
//       message.error("Please login again");
//       return;
//     }

//     try {
//       await axios.delete(`${API_BASE}/admin/users/${userId}/devices/${sessionId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       message.success("Device login removed successfully");
//       await fetchUserDevices(userId);
//       await fetchUsers(pagination.current, pagination.pageSize, roleFilter);
      
//       if (selectedUser && selectedUser.user_id === userId) {
//         setSelectedUser({
//           ...selectedUser,
//           active_login_count: selectedUser.active_login_count - 1
//         });
//       }
//     } catch (error) {
//       console.error("Failed to remove device:", error);
//       message.error(error.response?.data?.detail?.message || "Failed to remove device login");
//     }
//   };

//   const handleRemoveAllDevices = async (userId) => {
//     const token = getAuthToken();
//     if (!token) {
//       message.error("Please login again");
//       return;
//     }

//     try {
//       const response = await axios.delete(`${API_BASE}/admin/users/${userId}/devices`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       message.success(response.data.message || "All device logins removed successfully");
//       await fetchUsers(pagination.current, pagination.pageSize, roleFilter);
      
//       if (selectedUser && selectedUser.user_id === userId) {
//         setDrawerVisible(false);
//         setSelectedUser(null);
//         setUserDevices([]);
//       }
//     } catch (error) {
//       console.error("Failed to remove all devices:", error);
//       message.error(error.response?.data?.detail?.message || "Failed to remove all device logins");
//     }
//   };

//   const handleViewDevices = async (user) => {
//     setSelectedUser(user);
//     setDrawerVisible(true);
//     await fetchUserDevices(user.user_id);
//   };

//   const getPlatformIcon = (deviceName, platform) => {
//     const name = (deviceName || '').toLowerCase();
//     const plat = (platform || '').toLowerCase();
//     if (plat.includes('ios') || name.includes('iphone')) return <AppleOutlined className="text-gray-700 text-lg" />;
//     if (plat.includes('android') || name.includes('android')) return <AndroidOutlined className="text-green-600 text-lg" />;
//     if (plat.includes('windows') || name.includes('windows')) return <WindowsOutlined className="text-blue-600 text-lg" />;
//     if (name.includes('mac')) return <AppleOutlined className="text-gray-700 text-lg" />;
//     return <LaptopOutlined className="text-purple-600 text-lg" />;
//   };

//   const formatDuration = (seconds) => {
//     if (!seconds && seconds !== 0) return "N/A";
//     const days = Math.floor(seconds / 86400);
//     const hours = Math.floor((seconds % 86400) / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
    
//     if (days > 0) return `${days}d ${hours}h`;
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     if (minutes > 0) return `${minutes}m`;
//     return `${seconds}s`;
//   };

//   const formatDeviceDisplay = (device) => {
//     if (device.device_name) {
//       if (device.device_name.length > 50) {
//         return device.device_name.substring(0, 47) + "...";
//       }
//       return device.device_name;
//     }
//     return "Unknown Device";
//   };

//   const columns = [
//     {
//       title: "User",
//       dataIndex: "name",
//       key: "name",
//       render: (name, record) => (
//         <div className="flex items-center gap-3">
//           <Avatar 
//             size={42} 
//             src={getProfilePictureUrl(record.profile_picture_path)}
//             icon={!record.profile_picture_path && <UserOutlined />}
//             className="shadow-md"
//           />
//           <Space direction="vertical" size={0}>
//             <Text strong className="text-gray-800">{name || "N/A"}</Text>
//             <Text type="secondary" className="text-xs">{record.email}</Text>
//           </Space>
//         </div>
//       )
//     },
//     {
//       title: "Role",
//       dataIndex: "role",
//       key: "role",
//       render: (role) => {
//         const color = role === "admin" ? "red" : role === "driver" ? "blue" : "green";
//         const bgColor = role === "admin" ? "bg-red-50" : role === "driver" ? "bg-blue-50" : "bg-green-50";
//         const textColor = role === "admin" ? "text-red-600" : role === "driver" ? "text-blue-600" : "text-green-600";
//         return (
//           <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
//             {role?.toUpperCase() || "N/A"}
//           </span>
//         );
//       }
//     },
//     {
//       title: "Active Logins",
//       dataIndex: "active_login_count",
//       key: "active_login_count",
//       render: (count) => (
//         <div className="flex items-center gap-2">
//           <LaptopOutlined className={`text-lg ${count > 0 ? 'text-green-500' : 'text-gray-400'}`} />
//           <span className={`font-semibold ${count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
//             {count || 0}
//           </span>
//         </div>
//       )
//     },
//     {
//       title: "Last Active",
//       dataIndex: "last_used_at",
//       key: "last_used_at",
//       render: (date) => (
//         <span className="text-gray-600">
//           {date ? dayjs(date).fromNow() : 'Never'}
//         </span>
//       )
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Button
//             type="primary"
//             ghost
//             size="small"
//             icon={<EyeOutlined />}
//             onClick={() => handleViewDevices(record)}
//             disabled={!record.active_login_count || record.active_login_count === 0}
//             className="rounded-lg"
//           >
//             View
//           </Button>
//           <Popconfirm
//             title="Remove all logins"
//             description={`Remove all ${record.active_login_count || 0} device login(s)?`}
//             onConfirm={() => handleRemoveAllDevices(record.user_id)}
//             okText="Yes"
//             cancelText="No"
//             disabled={!record.active_login_count || record.active_login_count === 0}
//           >
//             <Button
//               danger
//               size="small"
//               icon={<DeleteFilled />}
//               disabled={!record.active_login_count || record.active_login_count === 0}
//               className="rounded-lg"
//             >
//               Remove All
//             </Button>
//           </Popconfirm>
//         </Space>
//       )
//     }
//   ];

//   const deviceColumns = [
//     {
//       title: "Device",
//       dataIndex: "device_name",
//       key: "device",
//       render: (name, record) => (
//         <div className="flex items-center gap-3">
//           {getPlatformIcon(record.device_name, record.platform)}
//           <div>
//             <div className="font-medium text-gray-800">{formatDeviceDisplay(record)}</div>
//             {record.browser && record.platform && (
//               <div className="text-xs text-gray-400">{record.browser} on {record.platform}</div>
//             )}
//           </div>
//         </div>
//       )
//     },
//     {
//       title: "IP Address",
//       dataIndex: "ip_address",
//       key: "ip",
//       render: (ip) => (
//         <code className="text-xs bg-gray-100 px-2 py-1 rounded">{ip || 'Unknown'}</code>
//       )
//     },
//     {
//       title: "Logged In",
//       dataIndex: "logged_in_for_seconds",
//       key: "logged_in",
//       render: (seconds) => (
//         <span className="text-gray-600">{formatDuration(seconds)}</span>
//       )
//     },
//     {
//       title: "Last Active",
//       dataIndex: "last_used_at",
//       key: "last_active",
//       render: (date) => (
//         <span className="text-gray-600">{date ? dayjs(date).fromNow() : 'Never'}</span>
//       )
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Popconfirm
//           title="Remove device login"
//           description="Are you sure you want to remove this device?"
//           onConfirm={() => handleRemoveDevice(selectedUser?.user_id, record.session_id)}
//           okText="Yes"
//           cancelText="No"
//         >
//           <Button type="link" danger icon={<DeleteOutlined />} size="small">
//             Remove
//           </Button>
//         </Popconfirm>
//       )
//     }
//   ];

//   const handleTableChange = (page, pageSize) => {
//     fetchUsers(page, pageSize, roleFilter);
//   };

//   const handleRoleFilterChange = (value) => {
//     setRoleFilter(value);
//     fetchUsers(1, pagination.pageSize, value);
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       setError("No authentication token found. Please login.");
//       message.error("Please login to access this page");
//       setTimeout(() => window.location.href = "/admin/login", 2000);
//     } else {
//       fetchUsers(1, 25, 'all');
//     }
//   }, []);

//   const pageVariants = {
//     initial: { opacity: 0, x: -20 },
//     animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
//     exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
//   };

//   if (loading && users.length === 0) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <div className="flex-1 flex flex-col">
//           <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <div className="flex-1 flex items-center justify-center">
//             <Spin size="large" tip="Loading device data..." />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error && users.length === 0) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <div className="flex-1 flex flex-col">
//           <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <div className="flex-1 p-8">
//             <Alert
//               message="Error Loading Data"
//               description={error}
//               type="error"
//               showIcon
//               action={
//                 <Button onClick={() => fetchUsers(1, 25, 'all')} type="primary">
//                   Retry
//                 </Button>
//               }
//             />
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
        
//         <motion.div
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           variants={pageVariants}
//           className="flex-1 overflow-y-auto p-6 lg:p-8"
//         >
//           <div className="max-w-7xl mx-auto">
//             {/* Page Header */}
//             <div className="mb-8">
//               <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Device Management</h1>
//               <p className="text-gray-500 text-sm">Monitor and manage user devices across the platform</p>
//             </div>

//             {/* Statistics Cards */}
//             <motion.div variants={cardVariants} className="mb-8">
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
//                     <Statistic
//                       title="Total Users"
//                       value={statistics.totalUsers}
//                       prefix={<UserOutlined className="text-indigo-500" />}
//                       valueStyle={{ color: '#3f51b5' }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
//                     <Statistic
//                       title="Active Devices"
//                       value={statistics.totalDevices}
//                       prefix={<LaptopOutlined className="text-green-500" />}
//                       valueStyle={{ color: '#52c41a' }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
//                     <Statistic
//                       title="Active Logins"
//                       value={statistics.totalActiveLogins}
//                       prefix={<DashboardOutlined className="text-blue-500" />}
//                       valueStyle={{ color: '#1890ff' }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
//                     <Statistic
//                       title="Critical Users"
//                       value={statistics.criticalCount}
//                       prefix={<WarningOutlined className="text-orange-500" />}
//                       valueStyle={{ color: '#fa8c16' }}
//                     />
//                   </Card>
//                 </Col>
//               </Row>
//             </motion.div>

//             {/* Main Table Card */}
//             <motion.div variants={cardVariants}>
//               <Card className="shadow-sm rounded-xl overflow-hidden">
//                 <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
//                   <div className="flex items-center gap-2">
//                     <CheckCircleOutlined className="text-green-500" />
//                     <span className="text-gray-600 text-sm">
//                       Showing {users.length} of {pagination.total} users
//                     </span>
//                   </div>
//                   <Space wrap>
//                     <Select
//                       value={roleFilter}
//                       onChange={handleRoleFilterChange}
//                       style={{ width: 130 }}
//                       className="rounded-lg"
//                     >
//                       <Option value="all">All Roles</Option>
//                       <Option value="admin">Admin</Option>
//                       <Option value="driver">Driver</Option>
//                       <Option value="passenger">Passenger</Option>
//                     </Select>
//                     <Button 
//                       icon={<ReloadOutlined />} 
//                       onClick={() => fetchUsers(pagination.current, pagination.pageSize, roleFilter)}
//                       loading={loading}
//                       className="rounded-lg"
//                     >
//                       Refresh
//                     </Button>
//                   </Space>
//                 </div>
                
//                 <Table
//                   columns={columns}
//                   dataSource={users}
//                   rowKey="user_id"
//                   loading={loading}
//                   pagination={{
//                     current: pagination.current,
//                     pageSize: pagination.pageSize,
//                     total: pagination.total,
//                     showSizeChanger: true,
//                     showTotal: (total) => `Total ${total} users`,
//                     onChange: handleTableChange
//                   }}
//                   className="[&_.ant-table-thead_.ant-table-cell]:bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:font-semibold"
//                 />
//               </Card>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Device Details Drawer */}
//       <Drawer
//         title={
//           <div className="flex items-center gap-3">
//             <Avatar 
//               size={48} 
//               src={getProfilePictureUrl(selectedUser?.profile_picture_path)}
//               icon={!selectedUser?.profile_picture_path && <UserOutlined />}
//               className="shadow-md"
//             />
//             <div>
//               <div className="font-semibold text-gray-800">{selectedUser?.name || selectedUser?.email}</div>
//               <div className="text-sm text-gray-500">
//                 {selectedUser?.email} • {selectedUser?.role?.toUpperCase()} • 
//                 <span className="ml-1 font-medium text-indigo-600">{selectedUser?.active_login_count || 0} active devices</span>
//               </div>
//             </div>
//           </div>
//         }
//         placement="right"
//         width={700}
//         onClose={() => {
//           setDrawerVisible(false);
//           setSelectedUser(null);
//           setUserDevices([]);
//         }}
//         open={drawerVisible}
//         extra={
//           <Popconfirm
//             title="Remove all logins"
//             description={`Remove all ${selectedUser?.active_login_count || 0} device(s)?`}
//             onConfirm={() => selectedUser && handleRemoveAllDevices(selectedUser.user_id)}
//             okText="Yes"
//             cancelText="No"
//             disabled={!selectedUser?.active_login_count || selectedUser?.active_login_count === 0}
//           >
//             <Button danger icon={<DeleteFilled />} disabled={!selectedUser?.active_login_count || selectedUser?.active_login_count === 0}>
//               Remove All
//             </Button>
//           </Popconfirm>
//         }
//       >
//         <Table
//           columns={deviceColumns}
//           dataSource={userDevices}
//           rowKey="session_id"
//           loading={devicesLoading}
//           pagination={false}
//           locale={{ emptyText: 'No active device logins' }}
//         />
//       </Drawer>
//     </div>
//   );
// };

// export default AllDevice;
// pages/admin/devices/AllDevice.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Badge,
  Button,
  Space,
  Select,
  message,
  Tag,
  Typography,
  Tooltip,
  Drawer,
  Popconfirm,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Avatar
} from 'antd';
import {
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  DeleteOutlined,
  EyeOutlined,
  DeleteFilled,
  ReloadOutlined,
  DashboardOutlined,
  UserOutlined,
  LaptopOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  AppleOutlined,
  AndroidOutlined,
  WindowsOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import { motion } from 'framer-motion';
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';

dayjs.extend(relativeTime);
dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;

// API Base URL
const API_BASE = "https://be.shuttleapp.transev.site";

const AllDevice = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0
  });
  const [roleFilter, setRoleFilter] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDevices, setUserDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalActiveLogins: 0,
    totalDevices: 0,
    criticalCount: 0
  });

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

  // Function to get full profile picture URL
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) return null;
    if (profilePicturePath.startsWith('http')) return profilePicturePath;
    return `${API_BASE}${profilePicturePath}`;
  };

  // Calculate statistics from users data
  const calculateStatistics = (usersData) => {
    const totalActiveLogins = usersData.reduce((sum, user) => sum + (user.active_login_count || 0), 0);
    const totalDevices = totalActiveLogins;
    const criticalCount = usersData.filter(user => (user.active_login_count || 0) >= 5).length;
    
    setStatistics({
      totalUsers: usersData.length,
      totalActiveLogins,
      totalDevices,
      criticalCount
    });
  };

  const fetchUsers = async (page = 1, pageSize = 25, role = null) => {
    setLoading(true);
    setError(null);
    
    const token = getAuthToken();
    if (!token) {
      setError("No authentication token found. Please login.");
      setLoading(false);
      message.error("Please login again");
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }

    try {
      const params = { page, page_size: pageSize };
      if (role && role !== 'all') params.role = role;
      
      const response = await axios.get(`${API_BASE}/admin/devices`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      if (response.data && response.data.items) {
        setUsers(response.data.items);
        calculateStatistics(response.data.items);
        setPagination({
          current: response.data.pagination?.page || 1,
          pageSize: response.data.pagination?.page_size || 25,
          total: response.data.pagination?.total || 0
        });
      } else {
        setUsers([]);
        setError("Invalid response format");
      }
    } catch (error) {
      console.error("API Error:", error);
      
      let errorMessage = "Failed to load users";
      if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to access this page.";
      } else if (error.response?.data?.detail?.message) {
        errorMessage = error.response.data.detail.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDevices = async (userId) => {
    setDevicesLoading(true);
    const token = getAuthToken();
    if (!token) {
      message.error("Please login again");
      setDevicesLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/admin/users/${userId}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setUserDevices(response.data.devices || []);
    } catch (error) {
      console.error("Failed to load devices:", error);
      message.error(error.response?.data?.detail?.message || "Failed to load devices");
      setUserDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleRemoveDevice = async (userId, sessionId) => {
    const token = getAuthToken();
    if (!token) {
      message.error("Please login again");
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}/devices/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("Device login removed successfully");
      await fetchUserDevices(userId);
      await fetchUsers(pagination.current, pagination.pageSize, roleFilter);
      
      if (selectedUser && selectedUser.user_id === userId) {
        setSelectedUser({
          ...selectedUser,
          active_login_count: selectedUser.active_login_count - 1
        });
      }
    } catch (error) {
      console.error("Failed to remove device:", error);
      message.error(error.response?.data?.detail?.message || "Failed to remove device login");
    }
  };

  const handleRemoveAllDevices = async (userId) => {
    const token = getAuthToken();
    if (!token) {
      message.error("Please login again");
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/admin/users/${userId}/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(response.data.message || "All device logins removed successfully");
      await fetchUsers(pagination.current, pagination.pageSize, roleFilter);
      
      if (selectedUser && selectedUser.user_id === userId) {
        setDrawerVisible(false);
        setSelectedUser(null);
        setUserDevices([]);
      }
    } catch (error) {
      console.error("Failed to remove all devices:", error);
      message.error(error.response?.data?.detail?.message || "Failed to remove all device logins");
    }
  };

  const handleViewDevices = async (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
    await fetchUserDevices(user.user_id);
  };

  const getPlatformIcon = (deviceName, platform) => {
    const name = (deviceName || '').toLowerCase();
    const plat = (platform || '').toLowerCase();
    if (plat.includes('ios') || name.includes('iphone')) return <AppleOutlined className="text-gray-700 text-lg" />;
    if (plat.includes('android') || name.includes('android')) return <AndroidOutlined className="text-green-600 text-lg" />;
    if (plat.includes('windows') || name.includes('windows')) return <WindowsOutlined className="text-blue-600 text-lg" />;
    if (name.includes('mac')) return <AppleOutlined className="text-gray-700 text-lg" />;
    return <LaptopOutlined className="text-purple-600 text-lg" />;
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatDeviceDisplay = (device) => {
    if (device.device_name) {
      if (device.device_name.length > 50) {
        return device.device_name.substring(0, 47) + "...";
      }
      return device.device_name;
    }
    return "Unknown Device";
  };

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={42} 
            src={getProfilePictureUrl(record.profile_picture_path)}
            icon={!record.profile_picture_path && <UserOutlined />}
            className="shadow-md"
          />
          <Space direction="vertical" size={0}>
            <Text strong className="text-gray-800">{name || "N/A"}</Text>
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </Space>
        </div>
      )
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const color = role === "admin" ? "red" : role === "driver" ? "blue" : "green";
        const bgColor = role === "admin" ? "bg-red-50" : role === "driver" ? "bg-blue-50" : "bg-green-50";
        const textColor = role === "admin" ? "text-red-600" : role === "driver" ? "text-blue-600" : "text-green-600";
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {role?.toUpperCase() || "N/A"}
          </span>
        );
      }
    },
    {
      title: "Active Logins",
      dataIndex: "active_login_count",
      key: "active_login_count",
      render: (count) => (
        <div className="flex items-center gap-2">
          <LaptopOutlined className={`text-lg ${count > 0 ? 'text-green-500' : 'text-gray-400'}`} />
          <span className={`font-semibold ${count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {count || 0}
          </span>
        </div>
      )
    },
    {
      title: "Last Active",
      dataIndex: "last_used_at",
      key: "last_used_at",
      render: (date) => (
        <span className="text-gray-600">
          {date ? dayjs(date).fromNow() : 'Never'}
        </span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDevices(record)}
            disabled={!record.active_login_count || record.active_login_count === 0}
            className="rounded-lg"
          >
            View
          </Button>
          <Popconfirm
            title="Remove all logins"
            description={`Remove all ${record.active_login_count || 0} device login(s)?`}
            onConfirm={() => handleRemoveAllDevices(record.user_id)}
            okText="Yes"
            cancelText="No"
            disabled={!record.active_login_count || record.active_login_count === 0}
          >
            <Button
              danger
              size="small"
              icon={<DeleteFilled />}
              disabled={!record.active_login_count || record.active_login_count === 0}
              className="rounded-lg"
            >
              Remove All
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const deviceColumns = [
    {
      title: "Device",
      dataIndex: "device_name",
      key: "device",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          {getPlatformIcon(record.device_name, record.platform)}
          <div>
            <div className="font-medium text-gray-800">{formatDeviceDisplay(record)}</div>
            {record.browser && record.platform && (
              <div className="text-xs text-gray-400">{record.browser} on {record.platform}</div>
            )}
          </div>
        </div>
      )
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip",
      render: (ip) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{ip || 'Unknown'}</code>
      )
    },
    {
      title: "Logged In",
      dataIndex: "logged_in_for_seconds",
      key: "logged_in",
      render: (seconds) => (
        <span className="text-gray-600">{formatDuration(seconds)}</span>
      )
    },
    {
      title: "Last Active",
      dataIndex: "last_used_at",
      key: "last_active",
      render: (date) => (
        <span className="text-gray-600">{date ? dayjs(date).fromNow() : 'Never'}</span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Remove device login"
          description="Are you sure you want to remove this device?"
          onConfirm={() => handleRemoveDevice(selectedUser?.user_id, record.session_id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Remove
          </Button>
        </Popconfirm>
      )
    }
  ];

  const handleTableChange = (page, pageSize) => {
    fetchUsers(page, pageSize, roleFilter);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    fetchUsers(1, pagination.pageSize, value);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please login.");
      message.error("Please login to access this page");
      setTimeout(() => window.location.href = "/admin/login", 2000);
    } else {
      fetchUsers(1, 25, 'all');
    }
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
  };

  if (loading && users.length === 0) {
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
            <Spin size="large" tip="Loading device data..." />
          </div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
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
          <div className="flex-1 p-8">
            <Alert
              message="Error Loading Data"
              description={error}
              type="error"
              showIcon
              action={
                <Button onClick={() => fetchUsers(1, 25, 'all')} type="primary">
                  Retry
                </Button>
              }
            />
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
        
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex-1 overflow-y-auto p-6 lg:p-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Device Management</h1>
              <p className="text-gray-500 text-sm">Monitor and manage user devices across the platform</p>
            </div>

            {/* Statistics Cards */}
            <motion.div variants={cardVariants} className="mb-8">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <Statistic
                      title="Total Users"
                      value={statistics.totalUsers}
                      prefix={<UserOutlined className="text-indigo-500" />}
                      valueStyle={{ color: '#3f51b5' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <Statistic
                      title="Active Devices"
                      value={statistics.totalDevices}
                      prefix={<LaptopOutlined className="text-green-500" />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <Statistic
                      title="Active Logins"
                      value={statistics.totalActiveLogins}
                      prefix={<DashboardOutlined className="text-blue-500" />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <Statistic
                      title="Critical Users"
                      value={statistics.criticalCount}
                      prefix={<WarningOutlined className="text-orange-500" />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Main Table Card */}
            <motion.div variants={cardVariants}>
              <Card className="shadow-sm rounded-xl overflow-hidden">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <span className="text-gray-600 text-sm">
                      Showing {users.length} of {pagination.total} users
                    </span>
                  </div>
                  <Space wrap>
                    <Select
                      value={roleFilter}
                      onChange={handleRoleFilterChange}
                      style={{ width: 130 }}
                      className="rounded-lg"
                    >
                      <Option value="all">All Roles</Option>
                      <Option value="admin">Admin</Option>
                      <Option value="driver">Driver</Option>
                      <Option value="passenger">Passenger</Option>
                    </Select>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => fetchUsers(pagination.current, pagination.pageSize, roleFilter)}
                      loading={loading}
                      className="rounded-lg"
                    >
                      Refresh
                    </Button>
                  </Space>
                </div>
                
                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="user_id"
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} users`,
                    onChange: handleTableChange
                  }}
                  className="[&_.ant-table-thead_.ant-table-cell]:bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:font-semibold"
                />
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Device Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar 
              size={48} 
              src={getProfilePictureUrl(selectedUser?.profile_picture_path)}
              icon={!selectedUser?.profile_picture_path && <UserOutlined />}
              className="shadow-md"
            />
            <div>
              <div className="font-semibold text-gray-800">{selectedUser?.name || selectedUser?.email}</div>
              <div className="text-sm text-gray-500">
                {selectedUser?.email} • {selectedUser?.role?.toUpperCase()} • 
                <span className="ml-1 font-medium text-indigo-600">{selectedUser?.active_login_count || 0} active devices</span>
              </div>
            </div>
          </div>
        }
        placement="right"
        width={700}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedUser(null);
          setUserDevices([]);
        }}
        open={drawerVisible}
        extra={
          <Popconfirm
            title="Remove all logins"
            description={`Remove all ${selectedUser?.active_login_count || 0} device(s)?`}
            onConfirm={() => selectedUser && handleRemoveAllDevices(selectedUser.user_id)}
            okText="Yes"
            cancelText="No"
            disabled={!selectedUser?.active_login_count || selectedUser?.active_login_count === 0}
          >
            <Button danger icon={<DeleteFilled />} disabled={!selectedUser?.active_login_count || selectedUser?.active_login_count === 0}>
              Remove All
            </Button>
          </Popconfirm>
        }
      >
        <Table
          columns={deviceColumns}
          dataSource={userDevices}
          rowKey="session_id"
          loading={devicesLoading}
          pagination={false}
          locale={{ emptyText: 'No active device logins' }}
        />
      </Drawer>
    </div>
  );
};

export default AllDevice;