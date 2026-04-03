"use client";
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Settings,
  User,
  MessageSquare,
  Menu,
  X,
  Plus,
  BarChart3,
  Calculator,
  Share2,
  Target,
  ArrowRight,
  TrendingUp,
  Calendar,
  ArrowLeftRight,
  DollarSign,
  PlayCircle,
  BarChart2,
  PieChart,
  Users,
  FileText,
  CreditCard,
  Briefcase,
  Activity,
  Home,
  Layers,
  Globe,
  Building,
  Shield,
  Phone,
  Mail,
  Download,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  MoreVertical,
  Star,
  Heart,
  Zap,
  Award,
  Wallet,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  SquareArrowOutUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Mock data
const mockSettings = [
  // {
  //   id: 1,
  //   icon: Building,
  //   title: "Portal Settings",
  //   description: "Report Settings, Logo Upload and Company Details",
  //   color: "bg-blue-100 text-blue-600",
  //   category: "general",
  //   link: "/external-setting"
  // },

  {
    id: 1,
    icon: FileText,
    title: "Schemes Configurations",
    description: "Add Scheme On the Basis of Need",
    color: "bg-blue-100 text-blue-600",
    category: "credentials",
    link: "/schemes-master"
  },

  // {
  //   id: 3,
  //   icon: Users,
  //   title: "User Settings",
  //   description: "Manage your organization users and provide menu access permissions",
  //   color: "bg-orange-100 text-orange-600",
  //   category: "users",
  //   link: "/external-setting"
  // },

  {
    id: 2,
    icon: SquareArrowOutUpRight,
    title: "External Settings",
    description: "Manage external credentials",
    color: "bg-orange-100 text-orange-600",
    category: "external",
    link: "/external-setting"
  } ,

   {
    id: 3,
     icon: Shield,
    title: "Recommended Fund",
    description: "Fund Strategies",
    color: "bg-green-100 text-green-600",
    category: "credentials",
    link: "/recommended-fund-settings"
   }

  // {
  //   id: 6,
  //   icon: CreditCard,
  //   title: "NSE Credentials",
  //   description: "NSE • MF II Username and Password",
  //   color: "bg-purple-100 text-purple-600",
  //   category: "credentials",
  //   link: "/external-setting"
  // },

  // {
  //   id: 7,
  //   icon: Award,
  //   title: "ARN Settings",
  //   description: "CAMS, Karvy, Fundtech Credentials and Billing details",
  //   color: "bg-yellow-100 text-yellow-600",
  //   category: "credentials",
  //   link: "/arn-list"
  // },
  // {
  //   id: 8,
  //   icon: Globe,
  //   title: "AMC ARN Mapping",
  //   description: "Choose AMCs that you are empanelled with",
  //   color: "bg-teal-100 text-teal-600",
  //   category: "mapping",
  //   link: "/external-setting"
  // },
  // {
  //   id: 9,
  //   icon: Mail,
  //   title: "Email & WhatsApp Configuration",
  //   description: "Set up your Email and WhatsApp to send all communications",
  //   color: "bg-red-100 text-red-600",
  //   category: "communication",
  //   link: "/external-setting"
  // },
  // {
  //   id: 10,
  //   icon: Bell,
  //   title: "Alert Configuration",
  //   description: "Configure System driven Alert mails to Investors and their MFDs",
  //   color: "bg-indigo-100 text-indigo-600",
  //   category: "alerts",
  //   link: "/external-setting"
  // },
  // {
  //   id: 11,
  //   icon: Phone,
  //   title: "SMS Configuration",
  //   description: "Configure your SMS for OTP during login/onboarding",
  //   color: "bg-pink-100 text-pink-600",
  //   category: "communication",
  //   link: "/external-setting"
  // },
  // {
  //   id: 12,
  //   icon: Wallet,
  //   title: "Investwell Subscriptions",
  //   description: "List of Subscribed Products with expiry dates",
  //   color: "bg-green-100 text-green-600",
  //   category: "subscriptions",
  //   link: "/external-setting"
  // },
  // {
  //   id: 13,
  //   icon: Calculator,
  //   title: "Transaction Permission",
  //   description: "Eg - Remove Redemption option for Investors",
  //   color: "bg-yellow-100 text-yellow-600",
  //   category: "permissions",
  //   link: "/external-setting"
  // },
  // {
  //   id: 14,
  //   icon: Settings,
  //   title: "Mobile App Configuration",
  //   description: "Activate features, custom messages and content, For White-Labelled app only",
  //   color: "bg-orange-100 text-orange-600",
  //   category: "mobile",
  //   link: "/external-setting"
  // },
  // {
  //   id: 15,
  //   icon: DollarSign,
  //   title: "Payout Rate Master",
  //   description: "Enter Sub Broker category wise Brokerage Payout rates",
  //   color: "bg-green-100 text-green-600",
  //   category: "finance",
  //   link: "/external-setting"
  // },
  // {
  //   id: 16,
  //   icon: FileText,
  //   title: "PMS Credentials",
  //   description: "Add PMS credentials to fetch current values and SOA",
  //   color: "bg-blue-100 text-blue-600",
  //   category: "credentials",
  //   link: "/external-setting"
  // }
];

// Settings Card Component
const SettingsCard = ({ setting, index }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={setting?.link || "/admin-setting"}>
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in-up`}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-lg ${setting.color} flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
            <setting.icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{setting.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{setting.description}</p>
          </div>
          <div className={`transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Filter Component
const FilterSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Settings', count: 14 },
    { id: 'general', label: 'General', count: 1 },
    { id: 'credentials', label: 'Credentials', count: 4 },
    { id: 'communication', label: 'Communication', count: 2 },
    { id: 'finance', label: 'Finance', count: 1 },
    { id: 'users', label: 'Users', count: 1 }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${activeFilter === filter.id
              ? 'bg-primary/85 text-white shadow-lg font-semibold'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            {filter.label}
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeFilter === filter.id
              ? 'bg-primary text-white font-semibold'
              : 'bg-gray-100 text-gray-600'
              }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Search Component
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
      </div>
    </div>
  );
};

// Stats Component
const StatsOverview = () => {
  const stats = [
    { label: 'Total Settings', value: '14', icon: Settings, color: 'bg-blue-100 text-blue-600' },
    { label: 'Configured', value: '8', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Pending', value: '6', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Alerts', value: '3', icon: AlertCircle, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const router = useRouter();
  const [filteredSettings, setFilteredSettings] = useState(mockSettings);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter settings based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = mockSettings.filter(setting =>
        setting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSettings(filtered);
    } else {
      setFilteredSettings(mockSettings);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen w-full bg-mainbackground">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin-dashboard')}
              className="flex items-center px-4 py-2 btn btn-primary text-white rounded-lg transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">General Settings</h1>
            <p className="text-gray-600">Manage your system configuration and preferences</p>
          </div>

          {/* Stats Overview */}
          {/* <StatsOverview /> */}

          {/* Search */}
          {/* <SearchComponent /> */}

          {/* Filter Section */}
          {/* <FilterSection /> */}

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSettings.map((setting, index) => (
              <SettingsCard key={setting.id} setting={setting} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredSettings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;