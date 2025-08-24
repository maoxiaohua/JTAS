import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Space, Button, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  ImportOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ComparisonAnalysis from './components/Analysis/ComparisonAnalysis';
import DataImportManager from './components/DataImport/DataImportManager';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState('dashboard');

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '效率仪表板',
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: '对比分析',
    },
    {
      key: 'import',
      icon: <ImportOutlined />,
      label: '数据导入',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    }
  ];

  // 用户菜单配置
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '偏好设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    }
  ];

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
  };

  const handleUserMenuClick = (e: { key: string }) => {
    switch (e.key) {
      case 'logout':
        // 处理退出登录
        console.log('退出登录');
        break;
      case 'profile':
        console.log('个人信息');
        break;
      case 'settings':
        console.log('偏好设置');
        break;
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'analysis':
        return <ComparisonAnalysis />;
      case 'import':
        return <DataImportManager />;
      case 'settings':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Title level={3}>系统设置</Title>
            <p>系统设置页面正在开发中...</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 1
        }}
      >
        {/* Logo区域 */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '8px'
        }}>
          {collapsed ? (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              JT
            </Title>
          ) : (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              JTAS
            </Title>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              JIRA工单效率分析系统
            </Title>
          </Space>

          <Space>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 主内容区域 */}
        <Content style={{
          margin: 0,
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;