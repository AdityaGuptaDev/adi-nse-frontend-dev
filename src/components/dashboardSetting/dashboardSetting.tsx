'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Bell, Palette, BarChart3, Shield, Globe, Download, Upload, 
  RefreshCw, Eye, EyeOff, Smartphone, Mail, MessageSquare, Lock, Key, 
  Calendar, Clock, DollarSign, TrendingUp, PieChart, BarChart, LineChart,
  Moon, Sun, Monitor, Zap, Database, Cloud, Wifi, AlertTriangle, CheckCircle,
  Filter, SortAsc, Grid, List, Layers, Maximize, Minimize, RotateCcw,
  FileText, Image, Video, Headphones, Volume2, VolumeX, Languages,
  MapPin, Timer, Activity, Archive, Trash2, HelpCircle, Info, Star
} from 'lucide-react';

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account settings
    firstName: 'Mr.',
    lastName: 'Tiwari',
    email: 'tiwari@example.com',
    phone: '+91 98765 43210',
    profileImage: null,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    smsAlerts: true,
    desktopNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Display settings
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    highContrast: false,
    
    // Dashboard settings
    autoRefresh: true,
    refreshInterval: '30',
    defaultView: 'overview',
    chartType: 'mixed',
    showValues: true,
    hideSmallHoldings: false,
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginNotifications: true,
    dataEncryption: true,
    
    // Data & Privacy
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata',
    language: 'english',
    
    // Advanced settings
    apiAccess: false,
    webhooks: false,
    developerMode: false,
    betaFeatures: false
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: User, color: 'bg-[#F59E0B]' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-green-500' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'bg-[#F59E0B]' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' },
    { id: 'preferences', label: 'Preferences', icon: Settings, color: 'bg-[#0A0A0A]0' },
    { id: 'data', label: 'Data & Privacy', icon: Database, color: 'bg-[#F59E0B]' },
    { id: 'advanced', label: 'Advanced', icon: Zap, color: 'bg-yellow-500' }
  ];

  const accentColors = [
    { name: 'blue', color: 'bg-[#F59E0B]', ring: 'ring-[#F59E0B]' },
    { name: 'green', color: 'bg-green-500', ring: 'ring-green-500' },
    { name: 'purple', color: 'bg-[#F59E0B]', ring: 'ring-purple-500' },
    { name: 'pink', color: 'bg-pink-500', ring: 'ring-pink-500' },
    { name: 'orange', color: 'bg-orange-500', ring: 'ring-orange-500' },
    { name: 'teal', color: 'bg-teal-500', ring: 'ring-teal-500' }
  ];

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ enabled, onChange, size = 'normal' }:any) => {
    const sizeClasses = size === 'small' ? 'h-5 w-9' : 'h-6 w-11';
    const thumbClasses = size === 'small' ? 'h-3 w-3' : 'h-4 w-4';
    const translateClasses = size === 'small' 
      ? (enabled ? 'translate-x-5' : 'translate-x-1')
      : (enabled ? 'translate-x-6' : 'translate-x-1');

    return (
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex ${sizeClasses} items-center rounded-full transition-colors duration-200 ${
          enabled ? 'bg-[#F59E0B]' : 'bg-[#1A1A1A]'
        }`}
      >
        <span
          className={`inline-block ${thumbClasses} transform rounded-full bg-[#111111] transition-transform duration-200 ${translateClasses} shadow-lg`}
        />
      </button>
    );
  };

  const SettingCard = ({ children, className = "" }:any) => (
    <div className={`bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-[#111111] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-[#F9FAFB]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F9FAFB]">Settings</h1>
                <p className="text-sm text-[#9CA3AF]">Customize your dashboard experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Reset
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-[#F9FAFB] rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center">
                    <span className="text-[#F9FAFB] font-semibold text-lg">MT</span>
                  </div>
                  <div>
                    <p className="text-[#F9FAFB] font-medium">{settings.firstName} {settings.lastName}</p>
                    <p className="text-gray-300 text-sm">{settings.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-1 ${
                        activeTab === tab.id
                          ? 'bg-[#1F1A1A] text-[#F59E0B] border-l-4 border-[#F59E0B] shadow-sm'
                          : 'text-[#9CA3AF] hover:bg-[#0A0A0A] hover:text-[#F9FAFB]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${activeTab === tab.id ? tab.color : 'bg-[#111111]'} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#F9FAFB]' : 'text-[#9CA3AF]'}`} />
                      </div>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <User className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Profile Information</h2>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-[#F9FAFB] text-2xl font-bold">
                        MT
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#F59E0B] rounded-full flex items-center justify-center text-[#F9FAFB] hover:bg-[#B45309] transition-colors">
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#F9FAFB]">Profile Picture</h3>
                      <p className="text-sm text-[#9CA3AF]">JPG, PNG up to 5MB</p>
                      <button className="mt-2 text-[#F59E0B] text-sm hover:text-[#F59E0B]">Upload new photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">First Name</label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => updateSetting('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Last Name</label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => updateSetting('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateSetting('email', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <MapPin className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Location & Preferences</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Country</label>
                      <select className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent">
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">City</label>
                      <input
                        type="text"
                        placeholder="Ranchi"
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Bell className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Notification Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-[#F59E0B]" />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">Email Notifications</p>
                          <p className="text-sm text-[#9CA3AF]">Receive updates via email</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={settings.emailNotifications}
                        onChange={(value: string) => updateSetting('emailNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">Push Notifications</p>
                          <p className="text-sm text-[#9CA3AF]">Mobile app notifications</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={settings.pushNotifications}
                        onChange={(value: string) => updateSetting('pushNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">SMS Alerts</p>
                          <p className="text-sm text-[#9CA3AF]">Text message notifications</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={settings.smsAlerts}
                        onChange={(value: string) => updateSetting('smsAlerts', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Monitor className="w-5 h-5 text-[#9CA3AF]" />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">Desktop Notifications</p>
                          <p className="text-sm text-[#9CA3AF]">Browser notifications</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={settings.desktopNotifications}
                        onChange={(value: string) => updateSetting('desktopNotifications', value)}
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Volume2 className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Sound & Alerts</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Sound Effects</span>
                      <ToggleSwitch
                        enabled={settings.soundEnabled}
                        onChange={(value: string) => updateSetting('soundEnabled', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Vibration</span>
                      <ToggleSwitch
                        enabled={settings.vibrationEnabled}
                        onChange={(value: string) => updateSetting('vibrationEnabled', value)}
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Alert Types</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Portfolio changes > 5%',
                      'SIP due reminders',
                      'Market news updates',
                      'Security alerts',
                      'System maintenance',
                      'New features'
                    ].map((alert, index) => (
                      <label key={index} className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-[#2A2A2A] text-[#F59E0B] focus:ring-[#F59E0B]" defaultChecked={index < 3} />
                        <span className="text-sm text-[#F9FAFB]">{alert}</span>
                      </label>
                    ))}
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Palette className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Theme & Colors</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-4">Theme Mode</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'auto', label: 'Auto', icon: Monitor }
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => updateSetting('theme', theme.id)}
                              className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                                settings.theme === theme.id
                                  ? 'border-[#F59E0B] bg-[#1F1A1A] text-[#F59E0B]'
                                  : 'border-[#2A2A2A] hover:border-[#2A2A2A]'
                              }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">{theme.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-4">Accent Color</label>
                      <div className="flex space-x-3">
                        {accentColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => updateSetting('accentColor', color.name)}
                            className={`w-10 h-10 rounded-full ${color.color} transition-all duration-200 ${
                              settings.accentColor === color.name
                                ? `ring-4 ${color.ring} ring-opacity-50 scale-110`
                                : 'hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Eye className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Display Options</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Font Size</label>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Compact Mode</span>
                      <ToggleSwitch
                        enabled={settings.compactMode}
                        onChange={(value: string) => updateSetting('compactMode', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Animations</span>
                      <ToggleSwitch
                        enabled={settings.animations}
                        onChange={(value: string) => updateSetting('animations', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">High Contrast</span>
                      <ToggleSwitch
                        enabled={settings.highContrast}
                        onChange={(value: string) => updateSetting('highContrast', value)}
                      />
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Dashboard Layout</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Default View</label>
                      <select
                        value={settings.defaultView}
                        onChange={(e) => updateSetting('defaultView', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="overview">Overview</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="transactions">Transactions</option>
                        <option value="analytics">Analytics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-4">Chart Type</label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: 'line', icon: LineChart, label: 'Line' },
                          { id: 'bar', icon: BarChart, label: 'Bar' },
                          { id: 'pie', icon: PieChart, label: 'Pie' },
                          { id: 'mixed', icon: TrendingUp, label: 'Mixed' }
                        ].map((chart) => {
                          const Icon = chart.icon;
                          return (
                            <button
                              key={chart.id}
                              onClick={() => updateSetting('chartType', chart.id)}
                              className={`p-3 border rounded-lg text-center transition-all ${
                                settings.chartType === chart.id
                                  ? 'border-[#F59E0B] bg-[#1F1A1A] text-[#F59E0B]'
                                  : 'border-[#2A2A2A] hover:border-[#2A2A2A]'
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-xs">{chart.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <RefreshCw className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Data Refresh</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Auto Refresh</span>
                      <ToggleSwitch
                        enabled={settings.autoRefresh}
                        onChange={(value: string) => updateSetting('autoRefresh', value)}
                      />
                    </div>

                    {settings.autoRefresh && (
                      <div>
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Refresh Interval</label>
                        <select
                          value={settings.refreshInterval}
                          onChange={(e) => updateSetting('refreshInterval', e.target.value)}
                          className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        >
                          <option value="15">15 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                          <option value="300">5 minutes</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Show Values</span>
                      <ToggleSwitch
                        enabled={settings.showValues}
                        onChange={(value: string) => updateSetting('showValues', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Hide Small Holdings</span>
                      <ToggleSwitch
                        enabled={settings.hideSmallHoldings}
                        onChange={(value: string) => updateSetting('hideSmallHoldings', value)}
                      />
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Shield className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Account Security</h2>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-green-800">Security Status: Strong</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full p-4 text-left border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-[#F59E0B]" />
                          <div>
                            <p className="font-medium text-[#F9FAFB]">Change Password</p>
                            <p className="text-sm text-[#9CA3AF]">Last changed 2 months ago</p>
                          </div>
                        </div>
                        <span className="text-[#F59E0B] text-sm font-medium">Update</span>
                      </div>
                    </button>

                    <button className="w-full p-4 text-left border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-[#F9FAFB]">Two-Factor Authentication</p>
                            <p className="text-sm text-[#9CA3AF]">Add an extra layer of security</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={settings.twoFactorAuth}
                          onChange={(value: string) => updateSetting('twoFactorAuth', value)}
                        />
                      </div>
                    </button>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Session Timeout</label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Activity className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Privacy Settings</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Login Notifications</span>
                      <ToggleSwitch
                        enabled={settings.loginNotifications}
                        onChange={(value: string) => updateSetting('loginNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F9FAFB]">Data Encryption</span>
                      <ToggleSwitch
                        enabled={settings.dataEncryption}
                        onChange={(value: string) => updateSetting('dataEncryption', value)}
                      />
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Globe className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Regional Settings</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => updateSetting('currency', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Date Format</label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => updateSetting('dateFormat', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Time Zone</label>
                      <select
                        value={settings.timeZone}
                        onChange={(e) => updateSetting('timeZone', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        <option value="english">English</option>
                        <option value="hindi">हिन्दी</option>
                        <option value="spanish">Español</option>
                      </select>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Download className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Export Data</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2 text-[#F59E0B]" />
                      <span className="text-sm font-medium">Portfolio Report</span>
                    </button>
                    <button className="p-4 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors text-center">
                      <Database className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <span className="text-sm font-medium">Transaction Data</span>
                    </button>
                    <button className="p-4 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-[#F59E0B]" />
                      <span className="text-sm font-medium">Analytics Report</span>
                    </button>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Upload className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Import Data</h2>
                  </div>

                  <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Cloud className="w-12 h-12 mx-auto mb-4 text-[#9CA3AF]" />
                    <p className="text-lg font-medium text-[#F9FAFB] mb-2">Drop files here or click to upload</p>
                    <p className="text-sm text-[#9CA3AF]">Supports CSV, Excel, JSON files up to 10MB</p>
                    <button className="mt-4 px-6 py-2 bg-[#F59E0B] text-[#F9FAFB] rounded-lg hover:bg-[#B45309] transition-colors">
                      Select Files
                    </button>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Data Management</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Data Retention Period</label>
                      <select className="w-full px-4 py-3 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent">
                        <option>Keep all data</option>
                        <option>Keep for 1 year</option>
                        <option>Keep for 2 years</option>
                        <option>Keep for 5 years</option>
                      </select>
                    </div>

                    <button className="w-full p-4 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-5 h-5 inline mr-2" />
                      Delete All Data
                    </button>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Advanced Features</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#F9FAFB]">Developer Mode</span>
                        <p className="text-sm text-[#9CA3AF]">Enable advanced debugging features</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.developerMode}
                        onChange={(value: string) => updateSetting('developerMode', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#F9FAFB]">Beta Features</span>
                        <p className="text-sm text-[#9CA3AF]">Try experimental features</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.betaFeatures}
                        onChange={(value: string) => updateSetting('betaFeatures', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#F9FAFB]">API Access</span>
                        <p className="text-sm text-[#9CA3AF]">Enable third-party integrations</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.apiAccess}
                        onChange={(value: string) => updateSetting('apiAccess', value)}
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-center space-x-4 mb-6">
                    <HelpCircle className="w-6 h-6 text-[#F59E0B]" />
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Support & Feedback</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors text-center">
                      <HelpCircle className="w-6 h-6 mx-auto mb-2 text-[#F59E0B]" />
                      <span className="text-sm font-medium">Help Center</span>
                    </button>
                    <button className="p-4 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                      <span className="text-sm font-medium">Rate App</span>
                    </button>
                  </div>
                </SettingCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}