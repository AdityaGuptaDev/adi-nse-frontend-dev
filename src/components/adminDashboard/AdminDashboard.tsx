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

// Golden Black Theme Constants
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

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
      color: "bg-[#1F1A1A] text-[#F59E0B]",
      trend: "+5.2%",
    },
    {
      label: "Total Investors",
      value: statsData.loading ? "..." : formatNumber(statsData.totalInvestors),
      icon: Users,
      color: "bg-[#2A1F0A] text-[#F59E0B]",
      trend: "+12.8%",
    },
    {
      label: "Total AUM",
      value: statsData.loading ? "..." : `₹${formatNumber(statsData.totalAUM)}`,
      icon: PieChart,
      color: "bg-[#2A1F0A] text-[#F59E0B]",
      trend: "+15.6%",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Quick Overview</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/admin-setting")}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: theme.gradient,
              color: "white",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Admin Settings</span>
          </button>
        </div>
      </div>

      {statsData.error && (
        <div className="p-3 rounded-lg mb-4" style={{ background: `${theme.danger}20`, color: theme.danger }}>
          {statsData.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F59E0B]/5 to-transparent rounded-full blur-2xl group-hover:bg-[#F59E0B]/10 transition-all"></div>
            <div className="flex items-center p-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110`}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}10 100%)`,
                }}
              >
                <stat.icon className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-bold truncate" style={{ color: theme.textPrimary }}>
                  {stat.value}
                </div>
                <div className="text-sm truncate mt-1" style={{ color: theme.textSecondary }}>{stat.label}</div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B]/0 via-[#F59E0B]/50 to-[#F59E0B]/0 group-hover:via-[#F59E0B] transition-all"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface QuickActionsProps {
  setOpenRegister: (open: boolean) => void;
}

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
      color: theme.primary,
      onClick: () => router.push('/partnerList')
    },
    {
      icon: Plus,
      label: "Add Partners",
      color: theme.warning,
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
      color: theme.textSecondary,
      onClick: () => router.push('/rm-list-dtl')
    },
    {
      icon: Plus,
      label: "Add RMs",
      color: theme.success,
      onClick: () => router.push('/user-management/user')
    },
    {
      icon: Users,
      label: "Investors",
      color: theme.success,
      onClick: () => router.push("/investor-list")
    },
    {
      icon: Plus,
      label: "Add Investor",
      color: theme.textSecondary,
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
      color: theme.danger,
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: Calculator,
      label: "Calculator",
      color: "#6366F1",
      onClick: () => router.push('/sip-calculator')
    },
  ];

  return (
    <div className="px-5 md:px-8 py-4">
      <h2 className="text-xl font-bold mb-5" style={{ color: theme.textPrimary }}>Quick Actions</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="group flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
            }}
            tabIndex={0}
            aria-label={action.label}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110"
              style={{ background: `${action.color}20` }}
            >
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-xs font-medium text-center" style={{ color: theme.textSecondary }}>
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
      <div key={`empty-${i}`} className="h-8"></div>
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
            className={`h-8 w-8 text-xs flex items-center justify-center rounded-full relative group transition-all duration-200 ${isBirthday
              ? "font-medium"
              : ""
              } ${day === new Date().getDate() && month === new Date().getMonth()
                ? "ring-2 ring-offset-1"
                : ""
              }`}
            style={{
              background: isBirthday ? `${theme.primary}20` : "transparent",
              color: isBirthday ? theme.primary : theme.textSecondary,
              ringColor: isBirthday ? theme.primary : "transparent",
            }}
          >
            {day}
            {isBirthday && (
              <div className="absolute z-50 hidden group-hover:block w-72 rounded-xl shadow-2xl p-4 left-1/2 top-full transform -translate-x-1/2 mt-2"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: `0 10px 40px rgba(0, 0, 0, 0.4)`,
                }}>
                <div className="flex items-center mb-3">
                  <CalendarIcon className="w-4 h-4 mr-2" style={{ color: theme.primary }} />
                  <h4 className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                    {new Date(currentYear, month, day).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dayBirthdays.map((bday, idx) => (
                    <div key={`${bday.inv_name}-${idx}`} className="p-2 rounded-lg transition-all hover:translate-x-1"
                      style={{ background: theme.hoverBg }}>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-2" style={{ color: theme.primary }} />
                        <span className="font-medium text-sm truncate" style={{ color: theme.textPrimary }}>{bday.inv_name}</span>
                      </div>
                      <div className="flex items-center mt-1 text-xs" style={{ color: theme.textSecondary }}>
                        <Phone className="w-3 h-3 mr-1" style={{ color: theme.success }} />
                        <span className="truncate">{bday.mobile_no}</span>
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
    <div className="rounded-xl shadow-lg overflow-visible w-full h-full min-h-[500px] flex flex-col transition-all duration-300 hover:shadow-xl"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}>
      <div className="p-5 flex-1">
        <h3 className="text-lg font-bold mb-5 flex items-center" style={{ color: theme.textPrimary }}>
          <CalendarIcon className="w-5 h-5 mr-2" style={{ color: theme.primary }} />
          {monthName} {currentYear}
        </h3>

        <div className="mb-4">
          <div className="text-center">
            <div className="grid grid-cols-7 gap-1 text-xs mb-2 font-medium" style={{ color: theme.textSecondary }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-1">
                  {day[0]}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-1 min-h-[168px]">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: theme.hoverBg }}></div>
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
          <div className="mt-5">
            <h4 className="text-xs font-semibold mb-3 flex items-center" style={{ color: theme.textSecondary }}>
              <Clock className="w-3 h-3 mr-1" style={{ color: theme.primary }} />
              UPCOMING BIRTHDAYS
            </h4>

            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-2">
                {upcomingBirthdays.map((birthday, index) => {
                  const formattedDate = birthday.nextOccurrence.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={`upcoming-${index}`}
                      className="flex items-center p-2 rounded-lg transition-all duration-300 hover:translate-x-1 hover:shadow-md"
                      style={{ background: theme.hoverBg }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 text-center rounded-full flex items-center justify-center mr-3 text-xs font-medium"
                        style={{
                          background: `${theme.primary}20`,
                          color: theme.primary,
                          border: `1px solid ${theme.border}`,
                        }}>
                        {formattedDate}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5 className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>{birthday.inv_name}</h5>
                        <p className="text-xs truncate" style={{ color: theme.textSecondary }}>{birthday.email}</p>
                        <p className="text-xs mt-0.5" style={{ color: theme.primary }}>
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
              <div className="text-center py-4 rounded-lg text-sm" style={{ background: theme.hoverBg, color: theme.textSecondary }}>
                No upcoming birthdays
              </div>
            )}
          </div>
        )}

        {!loading && getBirthdaysForMonth(currentMonth).length === 0 && (
          <div className="mt-4 text-center py-2 bg-[#1F1A1A] rounded text-xs text-[#9CA3AF]">
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
    <div className="px-5 sm:px-8 py-4">
      <div className="rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
        }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: `${theme.primary}20` }}>
              <TrendingUp className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
              Live Market Overview
            </h3>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full"
            style={{ background: `${theme.success}20` }}>
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: theme.success }}></div>
            <span className="text-sm font-medium" style={{ color: theme.success }}>Real-time Data</span>
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
      return { bg: '#10B98120', text: '#10B981' };
    case 'Moderate Risk':
      return { bg: '#F59E0B20', text: '#F59E0B' };
    case 'High Risk':
      return { bg: '#EF444420', text: '#EF4444' };
    case 'Very High Risk':
      return { bg: '#EF444440', text: '#EF4444' };
    default:
      return { bg: '#9CA3AF20', text: '#9CA3AF' };
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
      <div key={`empty-${i}`} className="h-10"></div>
    ));

    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    if (loading) {
      return Array.from({ length: 42 }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: theme.hoverBg }}></div>
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
            className="calendar-day relative h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer group"
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            onClick={() => handleDateClick(day)}
          >
            <div className={`
              absolute inset-0 rounded-lg transition-all z-10 border-2
              ${isToday
                ? 'border-opacity-100'
                : hasSip
                  ? 'border-opacity-50'
                  : 'border-transparent'
              }
              ${isSelected ? 'ring-2 ring-opacity-50' : ''}
              ${isPast ? 'opacity-60' : ''}
              group-hover:shadow-md
            `}
              style={{
                background: isToday ? `${theme.primary}` : (hasSip ? `${theme.primary}20` : theme.hoverBg),
                borderColor: isToday ? 'white' : (hasSip ? theme.primary : 'transparent'),
              }}
            ></div>

            <span className={`
              relative z-20 text-sm font-medium
              ${isToday ? 'text-[#F9FAFB]' : ''}
              ${isSelected ? 'font-bold' : ''}
            `} style={{ color: isToday ? 'white' : (hasSip ? theme.primary : theme.textSecondary) }}>
              {day}
            </span>

            {hasSip && !isToday && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full z-20" style={{ background: theme.primary }}></div>
            )}

            {isSelected && (
              <div className="absolute top-0 right-0 w-3 h-3 rounded-full z-20 transform translate-x-1 -translate-y-1" style={{ background: theme.primary }}>
                <div className="absolute inset-0.5 rounded-full" style={{ background: theme.cardBg }}></div>
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
        min-w-80 max-w-sm rounded-xl shadow-2xl
        animate-in fade-in-0 zoom-in-95 duration-200
      `}
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
        }}>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45"
          style={{
            background: theme.cardBg,
            borderRight: `1px solid ${theme.border}`,
            borderBottom: `1px solid ${theme.border}`,
          }}></div>

        <div className="flex items-center justify-between p-4 rounded-t-xl"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}20 0%, transparent 100%)`,
            borderBottom: `1px solid ${theme.border}`,
          }}>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
              {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: `${theme.primary}20`, color: theme.primary }}>
              {sips.length} SIP{sips.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 rounded-full transition-colors hover:bg-white/10"
              aria-label="Close tooltip"
            >
              <svg className="w-3 h-3" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="p-3 rounded-lg transition-all duration-300 hover:translate-x-1"
                style={{ background: theme.hoverBg }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate mb-1" style={{ color: theme.textPrimary }}>
                      {sip.scheme}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs" style={{ color: theme.textSecondary }}>
                      <User className="w-3 h-3" style={{ color: theme.primary }} />
                      <span className="truncate">{sip.inv_name}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap ml-2" style={{ color: theme.primary }}>
                    ₹{parseFloat(sip.sip_amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2" style={{ color: theme.textSecondary }}>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" style={{ color: theme.textSecondary }} />
                    <span className="truncate">Folio: {sip.folio_no}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" style={{ color: theme.textSecondary }} />
                    <span className="truncate">PAN: {sip.pan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-b-xl" style={{ background: theme.hoverBg, borderTop: `1px solid ${theme.border}` }}>
          <div className="flex justify-between items-center text-xs" style={{ color: theme.textSecondary }}>
            <span>Total Amount: ₹{sips.reduce((sum, sip) => sum + parseFloat(sip.sip_amount), 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl shadow-lg overflow-visible w-full h-full min-h-[600px] flex flex-col transition-all duration-300 hover:shadow-xl"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}>
      {/* Header */}
      <div className="p-5 rounded-t-xl"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}10 0%, transparent 100%)`,
          borderBottom: `1px solid ${theme.border}`,
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: `${theme.primary}20` }}>
              <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: theme.textPrimary }}>SIP Calendar</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-110"
              style={{ background: theme.hoverBg }}
            >
              <svg className="w-4 h-4" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-sm min-w-[120px] text-center" style={{ color: theme.textPrimary }}>
              {monthName} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-110"
              style={{ background: theme.hoverBg }}
            >
              <svg className="w-4 h-4" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg text-sm" style={{ background: `${theme.danger}20`, color: theme.danger }}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Calendar Grid Container with Tooltip */}
      <div className="p-5 relative flex-1">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: theme.textSecondary }}>
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
        <div className="flex items-center justify-center space-x-6 mt-4 pt-3 border-t" style={{ borderTopColor: theme.border }}>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{ background: theme.primary }}></div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{ background: `${theme.primary}20`, border: `1px solid ${theme.primary}` }}></div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>SIP Date</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ background: theme.primary }}></div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>Active SIP</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full relative" style={{ background: theme.primary }}>
              <div className="absolute inset-0.5 rounded-full" style={{ background: theme.cardBg }}></div>
            </div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>Selected</span>
          </div>
        </div>
      </div>

      {/* Upcoming SIPs */}
      <div className="border-t p-5 rounded-b-xl" style={{ borderTopColor: theme.border, background: `linear-gradient(135deg, ${theme.primary}05 0%, transparent 100%)` }}>
        <h4 className="font-semibold text-sm mb-3 flex items-center" style={{ color: theme.textPrimary }}>
          <TrendingUp className="w-4 h-4 mr-2" style={{ color: theme.primary }} />
          Upcoming SIPs This Month
        </h4>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: theme.hoverBg }}></div>
            ))}
          </div>
        ) : upcomingSips.length > 0 ? (
          <div className="space-y-3">
            {upcomingSips.map((sip, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-x-1"
                style={{ background: theme.hoverBg, border: `1px solid ${theme.border}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: theme.primary }}></div>
                    <div className="min-w-0">
                      <span className="font-bold truncate text-sm" style={{ color: theme.textPrimary }}>{sip.investor}</span>
                      <div className="flex items-center space-x-2 mt-1 text-xs" style={{ color: theme.textSecondary }}>
                        <Calendar className="w-3 h-3" style={{ color: theme.primary }} />
                        <span>Due on {monthName} {sip.date}</span>
                        <span>•</span>


                        <span className="truncate">{sip.pan}</span>
                      </div>
                      <h5 className="font-medium text-xs truncate mt-0.5" style={{ color: theme.textSecondary }}>
                        {sip.name}
                      </h5>

                    </div>
                  </div>
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-3" style={{ color: theme.primary }}>
                  {sip.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 rounded-lg text-sm" style={{ background: theme.hoverBg, color: theme.textSecondary }}>
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: theme.textSecondary }} />
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
      <div className="rounded-xl shadow-lg p-6 w-full h-full min-h-[500px]"
        style={{ background: theme.cardBg, border: `1px solid ${theme.border}` }}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg" style={{ background: theme.hoverBg }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl shadow-lg p-6 w-full h-full min-h-[500px]"
        style={{ background: theme.cardBg, border: `1px solid ${theme.border}` }}>
        <div className="p-4 rounded-lg" style={{ color: theme.danger }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg p-6 w-full h-full min-h-[500px] flex flex-col transition-all duration-300 hover:shadow-xl"
      style={{ background: theme.cardBg, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
          Top Performing Funds
        </h3>
        <button
          onClick={() => router.push('/mutual-fund')}
          className="text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{ color: theme.primary }}
        >
          View All Funds
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {funds.slice(0, 5).map((fund) => {
          const Icon = getFundIcon(fund.SchemeMaster.SchemeCategory.Name);
          const rating = fund.OverallRating || fund.performanceRating || 0;
          const riskColors = getRiskColor(fund.SchemeMaster.riskLevel);

          return (
            <div
              key={fund.id}
              className="flex gap-3 items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer hover:translate-x-1 hover:shadow-md"
              style={{ background: theme.hoverBg, border: `1px solid ${theme.border}` }}
              onClick={() => router.push(`/scheme-detail?id=${fund.scheme_id}&tab=NAV`)}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${theme.primary}20` }}>
                  <Icon className="w-5 h-5" style={{ color: theme.primary }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm truncate" style={{ color: theme.textPrimary }}>
                    {fund.SchemeMaster.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                    <span className="text-xs" style={{ color: theme.textSecondary }}>
                      {fund.SchemeMaster.SchemeSubcategory.Name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full`}
                      style={{ background: riskColors.bg, color: riskColors.text }}>
                      {fund.SchemeMaster.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`font-semibold text-sm ${fund.Return1yr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fund.Return1yr >= 0 ? '+' : ''}
                  {fund.Return1yr.toFixed(2)}%
                </div>
                <div className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                  {formatAUM(fund.AUM)} AUM
                </div>
                <div className="flex items-center justify-end mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < rating ? 'text-yellow-500' : 'text-[#9CA3AF]'}`}
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
    <div className="min-h-screen" style={{ background: theme.background }}>
      <AdminStatsOverview />
      <QuickActions setOpenRegister={setOpenRegister} />

      <MarketOverview />

      <div className="px-4 sm:px-0 lg:px-8 py-6">
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