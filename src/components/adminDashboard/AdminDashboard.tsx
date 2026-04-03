"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  Building2,
  TrendingUp,
  Settings,
  Plus,
  UserCheck,
  FileText,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Award,
  PieChart,
  Calculator,
  Search,
  Calendar,
  Globe,
  Zap,
  TrendingDown,
  CalendarIcon,
  Phone,
  Mail,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { fetchAdminCounts, fetchTopPerformingFunds } from "@/services/dashboards";
import TradingViewWidget from "./TradingViewWidget";
import { BirthdayService } from "../partnerDashboard/partnerDashboard.service";
import { getLS, removeLS, setLS } from "@/utils/helpers";
import { ADD_MEMBER, ADMIN_INVESTER_DATA, FLAT_MENU, MEMBER_DATA, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import getConfig from '@/utils/config';
import { cookieStorageKeys, removeCookieData, removeCookieToken } from "@/services/cookieStorageService";
import RegisterDialog from "../investor-onboarding/RegisterDialog";
import { get } from "http";





const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);


interface AdminStatsState {
  totalPartners: number;
  totalBcs: number;
  totalInvestors: number;
  totalAUM: number;
  activeClients: number;
  totalRevenue: number;
  totalRm: number;
  loading: boolean;
  error: string | null;
}

export const useTopPerformingFunds = () => {
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTopPerformingFunds();
        setFunds(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load top performing funds');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { funds, loading, error };
};

const AdminStatsOverview = () => {
  const router = useRouter();
  const [statsData, setStatsData] = useState<AdminStatsState>({
    totalPartners: 0,
    totalBcs: 0,
    totalInvestors: 0,
    totalAUM: 0,
    activeClients: 0,
    totalRevenue: 0,
    totalRm: 0,
    loading: true,
    error: null,
  });

  const formatNumber = (num: number) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const counts = await fetchAdminCounts();
        setStatsData({
          totalPartners: parseInt(counts.total_partner) || 0,
          totalBcs: parseInt(counts.total_bc) || 0,
          totalInvestors: parseInt(counts.total_clients) || 0,
          totalAUM: parseInt(counts.total_aum) || 0,
          activeClients: parseInt(counts.active_investor) || 0,
          totalRm: parseInt(counts.total_rm) || 0,
          totalRevenue: parseInt(counts.total_revenue) || 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatsData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch data'
        }));
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: "Total RMs",
      value: statsData.loading ? "..." : statsData.totalRm,
      icon: Users,
      color: "bg-yellow-100 text-yellow-700",
      trend: "+8.4%",
    },
    {
      label: "Total Partners",
      value: statsData.loading ? "..." : statsData.totalPartners,
      icon: User,
      color: "bg-blue-100 text-blue-600",
      trend: "+5.2%",
    },
    {
      label: "Total Investors",
      value: statsData.loading ? "..." : formatNumber(statsData.totalInvestors),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      trend: "+12.8%",
    },
    {
      label: "Total AUM",
      value: statsData.loading ? "..." : `₹${formatNumber(statsData.totalAUM)}`,
      icon: PieChart,
      color: "bg-indigo-100 text-indigo-600",
      trend: "+15.6%",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Overview</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/admin-setting")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admin Settings</span>
          </button>
        </div>
      </div>

      {statsData.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {statsData.error}
        </div>
      )}

      {/* Fixed Grid Layout - 4 columns on all screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-bold text-gray-900 truncate">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm truncate">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface QuickActionsProps {
  setOpenRegister: (open: boolean) => void;
}
// Quick Actions Component
const QuickActions: React.FC<QuickActionsProps> = ({ setOpenRegister }) => {

  const router = useRouter();
  const handleRegister = async (userType: string) => {
    if (!sessionStorage.getItem(USER_DATA)) {
      removeCookieToken();
      removeCookieData(cookieStorageKeys.INIT_PATH);
    }

    removeLS(PROD_DATA);
    removeLS(TOKEN_PREFIX);
    removeLS(MENU_PREFIX);
    removeLS(FLAT_MENU);
    removeLS(USER_DATA);
    removeLS(ADMIN_INVESTER_DATA);
    // remove_All_LS();

    // setOpenRegister(true)
    //router.push(`/register?userType=${userType}`);
    //router.push(`/partnerOnboarding`);
  };

  const actions = [
    {
      icon: Users,
      label: "Partners",
      color: "bg-blue-100 text-blue-600",
      onClick: () => router.push('/partnerList')
    },
    {
      icon: Plus,
      label: "Add Partners",
      color: "bg-orange-100 text-orange-600",
      // onClick: () => handleRegister('Partner')
      onClick: () => router.push('/partnerRegisterThroughAdmin')
    },
    // {
    //   icon: Users,
    //   label: "BC",
    //   color: "bg-blue-100 text-blue-600",
    //   onClick: () => router.push('/bcList')
    // },
    // {
    //   icon: Plus,
    //   label: "Add BC",
    //   color: "bg-orange-100 text-orange-600",
    //   //onClick: () => router.push('/bcOnboarding')
    //   onClick: () => router.push('/bcRegisterThroughAdmin')
    // },
    {
      icon: Shield,
      label: "RMs",
      color: "bg-gray-100 text-gray-600",
      onClick: () => router.push('/rm-list-dtl')
    },
    {
      icon: Plus,
      label: "Add RMs",
      color: "bg-green-100 text-green-600",
      onClick: () => router.push('/user-management/user')
    },
    {
      icon: Users,
      label: "Investors",
      color: "bg-green-100 text-green-600",
      onClick: () => router.push("/investor-list")
    },
    {
      icon: Plus,
      label: "Add Investor",
      color: "bg-green-100 text-slate-600",
      onClick: () => {
        const getUser = getLS(USER_DATA);
        delete getUser.InvestorRegistration;
        setLS(USER_DATA, getUser);
        removeLS(ADD_MEMBER);
        removeLS(MEMBER_DATA);

        router.push('/add-investor?id=' + getUser.id + "&userType=admin");
        // setOpenRegister(true)
        //handleRegister("Investor");
      }
    },
    {
      icon: Search,
      label: "Fund Finder",
      color: "bg-red-100 text-red-600",
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: Calculator,
      label: "Calculator",
      color: "bg-indigo-100 text-indigo-600",
      onClick: () => router.push('/sip-calculator')
    },
  ];

  return (
    <div className="px-5 md:px-5 py-4">


      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
      </div>





      {/* Single line */}
      <div className="flex justify-between items-center gap-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex-1 flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 min-w-0 mx-0.5"
            tabIndex={0}
            aria-label={action.label}
          >
            <div
              className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-1`}
            >
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-semibold text-gray-800 text-center leading-tight break-words">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface Birthday {
  inv_name: string;
  inv_dob: string;
  mobile_no: string;
  email: string;
  source_table: string;
}

const CalendarWidget = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString("default", { month: "long" }).toUpperCase();

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const data = await BirthdayService.getBirthdays();
        setBirthdays(data);
      } catch (error) {
        console.error("Failed to load birthdays", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const uniqueBirthdays = birthdays.reduce((acc: Birthday[], current) => {
    const exists = acc.some(
      item =>
        item.inv_name === current.inv_name &&
        new Date(item.inv_dob).getDate() === new Date(current.inv_dob).getDate()
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const getBirthdaysForMonth = (month: number) => {
    return uniqueBirthdays.filter(birthday => {
      const dob = new Date(birthday.inv_dob);
      return dob.getMonth() === month;
    });
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBirthdays = uniqueBirthdays.map(birthday => {
      const dob = new Date(birthday.inv_dob);
      const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      return {
        ...birthday,
        nextOccurrence: nextBirthday,
        daysUntil: Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    return upcomingBirthdays
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const renderCalendar = (month: number) => {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, month, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => (
      <div key={`empty-${i}`} className="h-6"></div>
    ));

    const monthBirthdays = getBirthdaysForMonth(month);
    const birthdayDays = [...new Set(
      monthBirthdays.map(birthday => new Date(birthday.inv_dob).getDate())
    )];

    return [
      ...emptyCells,
      ...days.map(day => {
        const isBirthday = birthdayDays.includes(day);
        const dayBirthdays = monthBirthdays.filter(birthday => {
          const dob = new Date(birthday.inv_dob);
          return dob.getDate() === day;
        });

        return (
          <div
            key={day}
            className={`h-6 w-6 text-xs flex items-center justify-center rounded-full relative group ${isBirthday
              ? "bg-gradient-to-br from-pink-100 to-purple-100 font-medium text-purple-800"
              : "text-gray-700 hover:bg-gray-100"
              } ${day === new Date().getDate() && month === new Date().getMonth()
                ? "ring-1 ring-blue-500"
                : ""
              }`}
          >
            {day}
            {isBirthday && (
              <div className="absolute z-50 hidden group-hover:block w-64 bg-white shadow-xl rounded-lg p-3 left-1/2 top-full transform -translate-x-1/2 mt-1 border border-gray-200">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="w-3 h-3 mr-1 text-purple-500" />
                  <h4 className="font-semibold text-gray-800 text-xs">
                    {new Date(currentYear, month, day).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                  {dayBirthdays.map((bday, idx) => (
                    <div key={`${bday.inv_name}-${idx}`} className="p-1.5 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="font-medium text-gray-800 truncate">{bday.inv_name}</span>
                      </div>
                      <div className="flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1 text-green-500" />
                        <span className="text-gray-600 truncate">{bday.mobile_no}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })
    ];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible w-full h-full min-h-[500px] flex flex-col">
      <div className="p-4 flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2 text-purple-600" />
          {monthName} {currentYear}
        </h3>

        {/* Calendar */}
        <div className="mb-4">
          <div className="text-center">
            <div className="grid grid-cols-7 gap-1 text-[10px] mb-1 font-medium text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-0.5">
                  {day[0]}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-1 min-h-[168px]">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-6 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="relative grid grid-cols-7 gap-1">
                {renderCalendar(currentMonth)}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Birthdays Section */}
        {!loading && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-blue-500" />
              UPCOMING BIRTHDAYS
            </h4>

            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-1.5">
                {upcomingBirthdays.map((birthday, index) => {
                  const formattedDate = birthday.nextOccurrence.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={`upcoming-${index}`}
                      className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 text-center px-1 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 text-xs font-medium text-purple-700">
                        {formattedDate}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5 className="text-xs font-medium text-gray-800 truncate">{birthday.inv_name}</h5>
                        <p className="text-[10px] text-gray-500 truncate">{birthday.email}</p>
                        <p className="text-[10px] text-blue-500">
                          {birthday.daysUntil === 0
                            ? "Today"
                            : `${birthday.daysUntil} day${birthday.daysUntil !== 1 ? 's' : ''} away`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-2 bg-gray-50 rounded text-xs text-gray-500">
                No upcoming birthdays
              </div>
            )}
          </div>
        )}

        {!loading && getBirthdaysForMonth(currentMonth).length === 0 && (
          <div className="mt-4 text-center py-2 bg-gray-50 rounded text-xs text-gray-500">
            No birthdays this month
          </div>
        )}
      </div>
    </div>
  );
};

// Real-time Market Overview Component
const MarketOverview = () => {
  return (
    <div className="px-5 sm:px-5 md:px-5 lg:px-5 xl:px-0 py-4">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Live Market Overview
            </h3>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Real-time Data</span>
          </div>
        </div>

        <div className="mt-4">
          <TradingViewWidget />
        </div>
      </div>
    </div>
  );
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low Risk':
      return 'text-green-600 bg-green-100';
    case 'Moderate Risk':
      return 'text-yellow-600 bg-yellow-100';
    case 'High Risk':
      return 'text-orange-600 bg-orange-100';
    case 'Very High Risk':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getFundIcon = (category: string) => {
  switch (category) {
    case 'Equity':
      return TrendingUp;
    case 'Debt':
      return Shield;
    case 'Hybrid':
      return Target;
    case 'Global':
      return Globe;
    default:
      return Zap;
  }
};

const formatAUM = (aum: number) => {
  if (aum >= 1000000000) {
    return `₹${(aum / 1000000000).toFixed(2)}B`;
  }
  if (aum >= 10000000) {
    return `₹${(aum / 10000000).toFixed(2)}Cr`;
  }
  if (aum >= 100000) {
    return `₹${(aum / 100000).toFixed(2)}L`;
  }
  return `₹${aum}`;
};

interface SipData {
  pan: string;
  inv_name: string;
  folio_no: string;
  scheme: string;
  isin: string;
  sip_amount: string;
  sip_date: string;
}

const fetchSipCalendar = async (in_user_id: string, in_ason_date: string) => {
  try {
    const response = await api.post(
      `${ApiUrl}/partner/getSipCalendar`,
      {
        in_role: "Admin",
        in_user_id,
        in_ason_date,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching SIP calendar:', error);
    throw error;
  }
};

const SipCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [sipData, setSipData] = useState<SipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.calendar-day') && !target.closest('.sip-tooltip')) {
        setSelectedDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserId = () => {
    try {
      const userData = getLS(USER_DATA);
      if (userData && userData.id) {
        return userData.id.toString();
      }
      const partnerData = getLS('partnerData');
      if (partnerData && partnerData.user_id) {
        return partnerData.user_id.toString();
      }
      console.warn('No user ID found in localStorage, using fallback');
      return "1";
    } catch (error) {
      console.error('Error getting user ID:', error);
      return "1";
    }
  };

  useEffect(() => {
    const loadSipData = async () => {
      try {
        setLoading(true);
        setError(null);
        const asonDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        const userId = getUserId();
        console.log('Fetching SIP data for user:', userId);
        const data = await fetchSipCalendar(userId, asonDate);
        setSipData(data);
      } catch (err) {
        setError('Failed to load SIP calendar data');
        console.error('Error loading SIP data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSipData();
  }, [currentMonth, currentYear]);

  const sipDates = [...new Set(sipData.map(sip => parseInt(sip.sip_date)))].sort((a, b) => a - b);

  const sipsByDate = sipData.reduce((acc, sip) => {
    const date = parseInt(sip.sip_date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(sip);
    return acc;
  }, {} as { [key: number]: SipData[] });

  const upcomingSips = sipData
    .filter(sip => parseInt(sip.sip_date) >= new Date().getDate())
    .slice(0, 4)
    .map(sip => ({
      name: sip.scheme,
      amount: `₹${parseFloat(sip.sip_amount).toLocaleString('en-IN')}`,
      date: parseInt(sip.sip_date),
      investor: sip.inv_name,
      pan: sip.pan
    }));

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(null);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isSipDate = (day: number) => {
    return sipDates.includes(day);
  };

  const getSipsForDate = (day: number) => {
    return sipsByDate[day] || [];
  };

  const handleDateClick = (day: number) => {
    if (isSipDate(day)) {
      setSelectedDate(selectedDate === day ? null : day);
    }
  };

  const getTooltipPosition = (day: number) => {
    const dayOfWeek = (getFirstDayOfMonth(currentMonth, currentYear) + day - 1) % 7;

    if (dayOfWeek <= 1) return "left-0";
    else if (dayOfWeek >= 5) return "right-0";
    else return "left-1/2 transform -translate-x-1/2";
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-8"></div>
    ));

    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    if (loading) {
      return Array.from({ length: 42 }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
      ));
    }

    return [
      ...emptyCells,
      ...days.map(day => {
        const hasSip = isSipDate(day);
        const sips = getSipsForDate(day);
        const isToday = isCurrentMonth && day === today.getDate();
        const isPast = isCurrentMonth && day < today.getDate();
        const isSelected = selectedDate === day;
        const isHovered = hoveredDay === day;
        const tooltipPosition = getTooltipPosition(day);
        const showTooltip = isSelected || (isHovered && hasSip);

        return (
          <div
            key={day}
            className="calendar-day relative h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer group"
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            onClick={() => handleDateClick(day)}
          >
            <div className={`
              absolute inset-0 rounded-lg transition-all z-10 border-2
              ${isToday
                ? 'bg-blue-500 border-blue-600'
                : hasSip
                  ? 'bg-green-50 border-green-200 hover:border-green-300'
                  : 'bg-gray-50 border-transparent'
              }
              ${isSelected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
              ${isPast ? 'opacity-60' : ''}
              group-hover:shadow-md
            `}></div>

            <span className={`
              relative z-20 text-sm font-medium
              ${isToday ? 'text-white' : 'text-gray-700'}
              ${isSelected ? 'font-bold' : ''}
            `}>
              {day}
            </span>

            {hasSip && !isToday && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full z-20"></div>
            )}

            {isSelected && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full z-20 transform translate-x-1 -translate-y-1">
                <div className="absolute inset-0.5 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        );
      })
    ];
  };

  const renderTooltip = () => {
    if (!selectedDate) return null;

    const sips = getSipsForDate(selectedDate);
    if (sips.length === 0) return null;

    const tooltipPosition = getTooltipPosition(selectedDate);

    return (
      <div className={`
        absolute z-50 sip-tooltip ${tooltipPosition} bottom-full mb-3
        min-w-80 max-w-sm bg-white shadow-2xl rounded-xl border border-gray-200
        animate-in fade-in-0 zoom-in-95 duration-200
      `}>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45"></div>

        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-gray-800 text-sm">
              {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {sips.length} SIP{sips.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 hover:bg-white rounded-full transition-colors"
              aria-label="Close tooltip"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <div className="p-3 space-y-3">
            {sips.map((sip, index) => (
              <div
                key={`${sip.pan}-${index}`}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate mb-1">
                      {sip.scheme}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="truncate">{sip.inv_name}</span>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-sm whitespace-nowrap ml-2">
                    ₹{parseFloat(sip.sip_amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">Folio: {sip.folio_no}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span className="truncate">PAN: {sip.pan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Total Amount: ₹{sips.reduce((sum, sip) => sum + parseFloat(sip.sip_amount), 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible w-full h-full min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">SIP Calendar</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 text-sm min-w-[120px] text-center">
              {monthName} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Calendar Grid Container with Tooltip */}
      <div className="p-4 relative flex-1">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day.substring(0, 1)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 relative">
          {renderCalendar()}

          {selectedDate && (
            <div className="absolute" style={{
              gridColumn: ((getFirstDayOfMonth(currentMonth, currentYear) + selectedDate - 1) % 7) + 1,
              gridRow: Math.floor((selectedDate + getFirstDayOfMonth(currentMonth, currentYear) - 1) / 7) + 2
            }}>
              {renderTooltip()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-3 pt-2 border-t border-gray-100">

          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-xs text-gray-600">SIP Date</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active SIP</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full relative">
              <div className="absolute inset-0.5 bg-white rounded-full"></div>
            </div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      {/* Upcoming SIPs */}
      <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-xl">
        <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
          Upcoming SIPs This Month
        </h4>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : upcomingSips.length > 0 ? (
          <div className="space-y-3">
            {upcomingSips.map((sip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="min-w-0">

                      <span className=" font-bold truncate">{sip.investor}</span>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Due on {monthName} {sip.date}</span>
                        <span>•</span>


                        <span className="truncate">{sip.pan}</span>
                      </div>
                      <h5 className="font-medium text-gray-800 text-[11px] truncate">
                        {sip.name}
                      </h5>

                    </div>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-sm whitespace-nowrap ml-3">
                  {sip.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm bg-white rounded-lg border border-gray-200">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No upcoming SIPs this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Top Performing Funds Component
export const TopPerformingFunds = () => {
  const router = useRouter();
  const { funds, loading, error } = useTopPerformingFunds();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full h-full min-h-[500px]">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full h-full min-h-[500px]">
        <div className="text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full h-full min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Performing Funds
        </h3>
        <button
          onClick={() => router.push('/mutual-fund')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All Funds
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {funds.slice(0, 5).map((fund) => {
          const Icon = getFundIcon(fund.SchemeMaster.SchemeCategory.Name);
          const rating = fund.OverallRating || fund.performanceRating || 0;

          return (
            <div
              key={fund.id}
              className="flex gap-2 items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push(`/scheme-detail?id=${fund.scheme_id}&tab=NAV`)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {fund.SchemeMaster.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">
                      {fund.SchemeMaster.SchemeSubcategory.Name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getRiskColor(
                        fund.SchemeMaster.riskLevel
                      )}`}
                    >
                      {fund.SchemeMaster.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-semibold text-sm ${fund.Return1yr >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {fund.Return1yr >= 0 ? '+' : ''}
                  {fund.Return1yr.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-600">
                  {formatAUM(fund.AUM)} AUM
                </div>
                <div className="flex items-center justify-end mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {

  const [openRegister, setOpenRegister] = useState(false);

  return (
    <div className="min-h-screen bg-mainbackground">
      <AdminStatsOverview />
      <QuickActions setOpenRegister={setOpenRegister} />

      <MarketOverview />



      <div className="px-4 sm:px-0 lg:px-0 py-6">

        {/* Desktop Layout - Three columns with consistent heights */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Column 1: Top Performing Funds */}
          <div className="h-full">
            <TopPerformingFunds />
          </div>

          {/* Column 2: SIP Calendar */}
          <div className="h-full">
            <SipCalendar />
          </div>

          {/* Column 3: Birthday Calendar */}
          <div className="h-full">
            <CalendarWidget />
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          <div className="h-full">
            <TopPerformingFunds />
          </div>
          <div className="h-full">
            <SipCalendar />
          </div>
          <div className="h-full">
            <CalendarWidget />
          </div>
        </div>
      </div>

      {openRegister && (
        <div className="items-center w-full h-screen" >
          <RegisterDialog open={openRegister} onClose={() => setOpenRegister(false)} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;