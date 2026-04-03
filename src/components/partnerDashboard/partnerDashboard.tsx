"use client";

import Header from "@/components/mainLayout/header";
import dynamic from 'next/dynamic';
import Sidebar from "@/components/mainLayout/sidebar";
import { usePageTitle } from "@/context/pageTitleContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  User,
  Zap,
  Plus,
  BarChart3,
  Calculator,
  Target,
  ArrowRight,
  TrendingUp,
  Calendar as CalendarIcon,
  ArrowLeftRight,
  BarChart2,
  Users,
  CreditCard,
  Shield,
  Globe,
  IndianRupee,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Activity,
  DollarSign,
  TrendingDown,
  Award,
  Crown,
  Star,
  Rocket,
  Target as TargetIcon,
  PieChart,
  LineChart,
  BarChart,
  Coffee,
  Gift,
  Cake,
  Briefcase,
  FileText,
  Download,
  Eye,
  Filter,
} from "lucide-react";

import { fetchPartnerCreatedStatus, fetchTopPerformingFunds, PartnerCount } from "@/services/dashboards";
import TradingViewWidgets from "./TradingViewWidgets";
import { getLS, removeLS, setLS } from "@/utils/helpers";
import { ADD_MEMBER, ADMIN_INVESTER_DATA, FLAT_MENU, MEMBER_DATA, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";

import api from "@/utils/api";
import getConfig from '@/utils/config';
import { cookieStorageKeys, removeCookieData, removeCookieToken } from "@/services/cookieStorageService";
import { encrypt } from '@/utils/aesmfu';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

const OnboardingAlertPopup = ({
  onClose,
  onContinue,
  isLoading = false
}: {
  onClose: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}) => {
  const [showPopup, setShowPopup] = useState(true);
  const [showRemindLater, setShowRemindLater] = useState(false);

  const handleClose = () => {
    setShowPopup(false);
    onClose();
  };

  const handleContinue = () => {
    setShowPopup(false);
    onContinue();
  };

  const handleRemindLater = () => {
    setShowPopup(false);
    setShowRemindLater(true);
    const remindLaterTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem('onboardingRemindLater', remindLaterTime.toString());
    onClose();
  };

  const RemindLaterToast = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowRemindLater(false);
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    if (!showRemindLater) return null;

    return (
      <div className="fixed top-6 right-6 z-50 animate-slide-in">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 shadow-2xl flex items-center space-x-3 border border-blue-300">
          <Clock className="w-5 h-5 text-white" />
          <div>
            <p className="text-sm font-semibold text-white">Reminder set! 🎯</p>
            <p className="text-xs text-blue-100">We'll remind you again in 24 hours</p>
          </div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </div>
    );
  };

  if (!showPopup) return (
    <>
      <RemindLaterToast />
      {null}
    </>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in border border-gray-200">

          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  {isLoading ? (
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <AlertCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isLoading ? 'Checking Status...' : 'Complete Onboarding ✨'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {isLoading ? 'Verifying your profile status' : 'Unlock all features and start growing'}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-blue-500 animate-bounce" />
                  </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Checking your status...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Your partner onboarding is <span className="font-bold text-blue-600">almost complete</span>. Finish setup to access all dashboard features and start managing clients like a pro! 🚀
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { label: "Verify your identity", icon: Shield },
                    { label: "Set up payment preferences", icon: CreditCard },
                    { label: "Configure investment preferences", icon: TargetIcon }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-yellow-100 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Premium Access Awaits! 🏆</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Complete onboarding to unlock investor management, advanced reports, and portfolio tracking features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRemindLater}
                  className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex-1 flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Remind Me Later
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex-1 flex items-center justify-center space-x-2 group"
                >
                  <span>Complete Setup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <RemindLaterToast />
    </>
  );
};


const useOnboardingAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const userData = getLS(USER_DATA);
        setIsChecking(true);

        const mobileNumber = userData?.user?.mobile || userData?.mobile;

        if (!mobileNumber) {
          console.warn('No mobile number found for user');
          setIsChecking(false);
          return;
        }

        const userCreated = await fetchPartnerCreatedStatus(mobileNumber);
        console.log('Partner creation status:', userCreated);

        if (userCreated !== 1) {
          setShowAlert(true);
        } else {
          console.log('Onboarding already completed, hiding alert');
          setShowAlert(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(checkOnboardingStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinueOnboarding = () => {
    const user = getLS(PROD_DATA)?.user;
    const mobileForUrl = user.mobile;
    router.push(`/partnerOnboarding?mobile=${mobileForUrl}`);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return {
    showAlert,
    isChecking,
    handleContinueOnboarding,
    handleCloseAlert
  };
};


const AlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return null;
};

const MarketOverviewSkeleton = () => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 h-[400px] animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-7 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
      <div className="h-5 w-24 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
  </div>
);

const QuickActions = () => {
  const router = useRouter();
  const handleRegister = async (userType: string, partnerId: number) => {
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

    if (partnerId) {
      router.push(`/my-profile`);
    } else {
      router.push(`/my-profile`);
    }
  };

  const actions = [
    {
      icon: Users,
      label: "Investors",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:shadow-blue-200",
      onClick: () => router.push('/investor-list')
    },
    {
      icon: Plus,
      label: "Add Investors",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      hoverColor: "hover:shadow-emerald-200",
      onClick: () => {
        const getUser = getLS(USER_DATA);
        delete getUser.InvestorRegistration;
        const partner_id = getUser.partner.regId;
     

        setLS(USER_DATA, getUser);
        removeLS(ADD_MEMBER);
        removeLS(MEMBER_DATA);

        const encodedData = encrypt(JSON.stringify({ userType: 'Partner', userId: partner_id }));
        router.push(`/add-investor?id` + `=${encodedData}`);
      }
    },
    {
      icon: Search,
      label: "Fund Finder",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      hoverColor: "hover:shadow-amber-200",
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: Calculator,
      label: "Calculator",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      hoverColor: "hover:shadow-rose-200",
      onClick: () => router.push('/sip-calculator')
    },
    {
      icon: BarChart2,
      label: "Portfolio Tracker",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:shadow-purple-200",
      onClick: () => router.push('/portfolio')
    },
    {
      icon: FileText,
      label: "Clients Reports",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      hoverColor: "hover:shadow-indigo-200",
      onClick: () => router.push('/search-report')
    },
    {
      icon: Target,
      label: "Investment Goal",
      color: "from-teal-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-emerald-50",
      borderColor: "border-teal-200",
      hoverColor: "hover:shadow-teal-200",
      onClick: () => router.push('/goal-list')
    },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600">Frequently used tools & shortcuts</p>
          </div>
        </div>
      
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.slice(0, 6).map((action, index) => (
          <button
            key={index}
            className={`relative group ${action.bgColor} rounded-xl border ${action.borderColor} p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${action.hoverColor}`}
            tabIndex={0}
            aria-label={action.label}
            onClick={action.onClick}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

            <div className={`relative w-10 h-10 rounded-lg ${action.bgColor} border ${action.borderColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-20`}></div>
              <action.icon className={`w-5 h-5 ${action.color.replace('from-', 'text-').split(' ')[0]}`} />
            </div>

            <span className="text-xs font-semibold text-gray-800 text-center block group-hover:text-gray-900 transition-colors">
              {action.label}
            </span>

            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};


const LiveMarketOverview = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 h-full overflow-hidden">

      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Live Market Overview
              </h3>
              <p className="text-sm text-gray-600 mt-1">Real-time market data & trends</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Live</span>
          </div>
        </div>

        {isMounted && !isLoading ? (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <TradingViewWidgets />
          </div>
        ) : (
          <MarketOverviewSkeleton />
        )}
      </div>
    </div>
  );
};


interface Birthday {
  name: string | null;
  dob: string | null;
  reg_email: string;
  reg_mobile: string;
}

interface BirthdayApiResponse {
  data: {
    data: Birthday[];
    count: number;
  };
  msg: string;
}

interface CalendarWidgetProps {
  userTypeId: number;
}

const CalendarWidget = ({ userTypeId }: CalendarWidgetProps) => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString("default", { month: "long" }).toUpperCase();

  useEffect(() => {
    const fetchBirthdays = async () => {
      if (!userTypeId || userTypeId === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<BirthdayApiResponse>(
          `${ApiUrl}/partner/userTypeBirthdayDtl/${userTypeId}`
        );

        const validBirthdays = response.data?.data?.data?.filter(
          (bday) => bday.name && bday.dob
        ) || [];

        setBirthdays(validBirthdays);
      } catch (error) {
        console.error("Failed to load birthdays", error);
        setBirthdays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [userTypeId]);

  const uniqueBirthdays = birthdays.reduce((acc: Birthday[], current) => {
    if (!current.dob) return acc;

    const exists = acc.some(
      item =>
        item.name === current.name &&
        new Date(item.dob!).getDate() === new Date(current.dob!).getDate()
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const getBirthdaysForMonth = (month: number) => {
    return birthdays.filter(birthday => {
      if (!birthday.dob) return false;
      const dob = new Date(birthday.dob);
      return dob.getMonth() === month;
    });
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBirthdays = uniqueBirthdays
      .filter(bday => bday.dob)
      .map(birthday => {
        const dob = new Date(birthday.dob!);
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
      monthBirthdays.map(birthday => new Date(birthday.dob!).getDate())
    )];

    return [
      ...emptyCells,
      ...days.map(day => {
        const isBirthday = birthdayDays.includes(day);
        const isToday = day === new Date().getDate() && month === new Date().getMonth();
        const dayBirthdays = monthBirthdays.filter(birthday => {
          const dob = new Date(birthday.dob!);
          return dob.getDate() === day;
        });

        return (
          <div
            key={`day-${day}`}
            className={`relative group h-8 w-8 text-sm flex items-center justify-center rounded-full transition-all duration-200 ${isBirthday
                ? "bg-gradient-to-br from-pink-100 to-purple-100 font-bold text-purple-700 hover:from-pink-200 hover:to-purple-200"
                : "text-gray-700 hover:bg-gray-100"
              } ${isToday
                ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50"
                : ""
              }`}
          >
            {day}
            {isBirthday && (
              <>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="absolute z-50 hidden group-hover:block w-64 bg-white shadow-2xl rounded-xl p-4 left-1/2 top-full transform -translate-x-1/2 mt-2 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Cake className="w-4 h-4 mr-2 text-purple-500" />
                    <h4 className="font-bold text-gray-800 text-sm">
                      {new Date(currentYear, month, day).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dayBirthdays.map((bday, idx) => (
                      <div
                        key={`${bday.name}-${idx}-${bday.reg_mobile}`}
                        className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 animate-slide-up"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-2 text-blue-500" />
                          <span className="font-semibold text-gray-800 truncate text-xs">{bday.name}</span>
                        </div>
                        <div className="flex items-center mt-1 ml-5">
                          <Phone className="w-3 h-3 mr-1 text-green-500" />
                          <span className="text-gray-600 truncate text-xs">{bday.reg_mobile}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })
    ];
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-visible">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{monthName} {currentYear}</h3>
              <p className="text-sm text-gray-600">Birthdays & Events</p>
            </div>
          </div>
          <Gift className="w-5 h-5 text-purple-400 animate-bounce" />
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <div className="text-center">
            <div className="grid grid-cols-7 gap-1 text-xs mb-2 font-semibold text-gray-500">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={`weekday-${i}`} className="p-2">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-1 min-h-[168px]">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse h-8 bg-gray-100 rounded-lg"></div>
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
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                UPCOMING BIRTHDAYS
              </h4>
              <span className="text-xs text-purple-600 font-medium">
                {upcomingBirthdays.length} this month
              </span>
            </div>

            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-3">
                {upcomingBirthdays.map((birthday, index) => {
                  if (!birthday.dob) return null;

                  const formattedDate = birthday.nextOccurrence.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={`upcoming-${index}-${birthday.name}`}
                      className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 group"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 flex items-center justify-center mr-3 text-xs font-bold text-purple-700">
                        {formattedDate}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center">
                          <h5 className="text-sm font-bold text-gray-800 truncate">{birthday.name}</h5>
                          {birthday.daysUntil <= 3 && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                              SOON
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">{birthday.reg_email}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold ${birthday.daysUntil === 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {birthday.daysUntil === 0
                            ? "🎉 Today!"
                            : `${birthday.daysUntil}d`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-sm text-gray-500">
                <Cake className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                No upcoming birthdays
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const PartnerProfileCard = () => {
  const [statsData, setStatsData] = useState({
    totalCount: 0,
    activeCount: 0,
    aumSum: 0,
    transcount: 0,
    revenueCount: 0,
    brokerageCount: 0,
    email: "",
    mobile: "",
    pan: "",
    loading: true,
    error: null as string | null
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalCount: 0,
    aumSum: 0,
    transcount: 0
  });

  const getPartnerData = () => {
    const userData = getLS(USER_DATA);

    if (!userData) {
      
      return {
        partnerRegId: 0,
        email: "N/A",
        mobile: "N/A",
        pan: "N/A",
        name: "N/A"
      };
    }

    const partnerRegId =
      userData?.partner?.regId ||
      userData?.partner?.partnerId ||
      userData?.partner?.id ||
      userData?.regId ||
      userData?.id ||
      userData?.user?.regId ||
      userData?.user?.id ||
      0;

    const email =
      userData?.partner?.email ||
      userData?.email ||
      userData?.user?.email ||
      "N/A";

    const mobile =
      userData?.partner?.mobile ||
      userData?.mobile ||
      userData?.user?.mobile ||
      "N/A";

    const pan =
      userData?.partner?.pan ||
      userData?.pan ||
      userData?.user?.pan ||
      "N/A";

    const name =
      userData?.partner?.name ||
      userData?.name ||
      userData?.user?.name ||
      "N/A";


    return { partnerRegId, email, mobile, pan, name };
  };

  const partnerData = getPartnerData();
  const partnerRegId = partnerData.partnerRegId;

  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
    

        if (!partnerRegId || partnerRegId === 0) {
          console.warn('⚠ No valid partnerRegId found, showing basic info');
          setStatsData(prev => ({
            ...prev,
            email: partnerData.email,
            mobile: partnerData.mobile,
            pan: partnerData.pan,
            loading: false,
            error: 'Partner ID not available - showing basic info only'
          }));
          return;
        }

        const response = await PartnerCount.getPartnerCount(partnerRegId);

        const apiData = response;

        const newData = {
          totalCount: parseInt(apiData.total_investor) || 0,
          activeCount: parseInt(apiData.total_active_partner) || 0,
          aumSum: parseFloat(apiData.total_aum) || 0,
          transcount: parseInt(apiData.total_transaction) || 0,
          revenueCount: parseFloat(apiData.total_revenue) || 0,
          brokerageCount: parseFloat(apiData.total_brokerage) || 0,
          email: apiData.email || partnerData.email || "N/A",
          mobile: apiData.mobile || partnerData.mobile || "N/A",
          pan: apiData.pan || partnerData.pan || "N/A",
          loading: false,
          error: null
        };

        setStatsData(newData);

        const duration = 1500;
        const steps = 60;
        const stepDuration = duration / steps;

        Object.keys(animatedStats).forEach(key => {
          const target = newData[key as keyof typeof newData];
          const start = 0;
          const increment = (target - start) / steps;

          let current = start;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setAnimatedStats(prev => ({
              ...prev,
              [key]: Math.floor(current)
            }));
          }, stepDuration);
        });

      } catch (error) {

        setStatsData(prev => ({
          ...prev,
          email: partnerData.email,
          mobile: partnerData.mobile,
          pan: partnerData.pan,
          loading: false,
          error: 'Failed to fetch detailed data - showing basic info'
        }));
      }
    };

    fetchData();
  }, [partnerRegId]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Partner Profile</h2>
            <p className="text-sm text-gray-600">Your business dashboard overview</p>
          </div>
        </div>
        {statsData.error && (
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">{statsData.error}</p>
          </div>
        )}
      </div>

      {/* Partner Info Section */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          { icon: Mail, label: "Email", value: statsData.loading ? "..." : statsData.email, color: "text-blue-500" },
          { icon: Phone, label: "Mobile", value: statsData.loading ? "..." : statsData.mobile, color: "text-emerald-500" },
          { icon: CreditCard, label: "PAN", value: statsData.loading ? "..." : statsData.pan, color: "text-purple-500" },
          { icon: Award, label: "Partner ID", value: partnerRegId || "Not found", color: "text-amber-500" }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-300 group"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${item.color.replace('text', 'bg')}/10`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BusinessOverviewStats = () => {
  const [statsData, setStatsData] = useState({
    totalCount: 0,
    activeCount: 0,
    aumSum: 0,
    transcount: 0,
    revenueCount: 0,
    brokerageCount: 0,
    email: "",
    mobile: "",
    pan: "",
    loading: true,
    error: null as string | null
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalCount: 0,
    aumSum: 0,
    transcount: 0
  });

  const getPartnerData = () => {
    const userData = getLS(USER_DATA);

    if (!userData) {
      return {
        partnerRegId: 0,
        email: "N/A",
        mobile: "N/A",
        pan: "N/A",
        name: "N/A"
      };
    }

    const partnerRegId =
      userData?.partner?.regId ||
      userData?.partner?.partnerId ||
      userData?.partner?.id ||
      userData?.regId ||
      userData?.id ||
      userData?.user?.regId ||
      userData?.user?.id ||
      0;

    return { partnerRegId, email: "N/A", mobile: "N/A", pan: "N/A", name: "N/A" };
  };

  const partnerData = getPartnerData();
  const partnerRegId = partnerData.partnerRegId;

  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!partnerRegId || partnerRegId === 0) {
          setStatsData(prev => ({
            ...prev,
            loading: false,
            error: 'Partner ID not available'
          }));
          return;
        }

        const response = await PartnerCount.getPartnerCount(partnerRegId);
        const apiData = response;

        const newData = {
          totalCount: parseInt(apiData.total_investor) || 0,
          activeCount: parseInt(apiData.total_active_partner) || 0,
          aumSum: parseFloat(apiData.total_aum) || 0,
          transcount: parseInt(apiData.total_transaction) || 0,
          revenueCount: parseFloat(apiData.total_revenue) || 0,
          brokerageCount: parseFloat(apiData.total_brokerage) || 0,
          email: apiData.email || "N/A",
          mobile: apiData.mobile || "N/A",
          pan: apiData.pan || "N/A",
          loading: false,
          error: null
        };

        setStatsData(newData);

        const duration = 1500;
        const steps = 60;
        const stepDuration = duration / steps;

        Object.keys(animatedStats).forEach(key => {
          const target = newData[key as keyof typeof newData];
          const start = 0;
          const increment = (target - start) / steps;

          let current = start;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setAnimatedStats(prev => ({
              ...prev,
              [key]: Math.floor(current)
            }));
          }, stepDuration);
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
  }, [partnerRegId]);

  const stats = [
    {
      label: "Total Clients",
      value: statsData.loading ? "..." : animatedStats.totalCount,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
     
    },
    {
      label: "AUM",
      value: statsData.loading ? "..." : formatNumber(animatedStats.aumSum),
      icon: BarChart3,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
     
    },
    {
      label: "Transactions",
      value: statsData.loading ? "..." : animatedStats.transcount,
      icon: ArrowLeftRight,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
     
    },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Business Overview</h2>
          <p className="text-sm text-gray-600">Key performance metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative group ${stat.bgColor} rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5`}
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
                <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low Risk':
      return 'from-green-400 to-emerald-500';
    case 'Moderate Risk':
      return 'from-yellow-400 to-amber-500';
    case 'High Risk':
      return 'from-orange-400 to-red-500';
    case 'Very High Risk':
      return 'from-red-500 to-pink-600';
    default:
      return 'from-gray-400 to-gray-500';
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

const MutualFundPerformance = () => {
  const router = useRouter();
  const { funds, loading, error } = useTopPerformingFunds();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border border-red-200 p-6">
        <div className="text-red-500 p-4 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Top Performing Funds
            </h3>
            <p className="text-sm text-gray-600">Based on 1-year returns</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/mutual-fund')}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:shadow-lg transition-all duration-300 text-sm font-semibold border border-blue-200 hover:border-blue-300"
        >
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {funds.slice(0, 5).map((fund, index) => {
          const Icon = getFundIcon(fund.SchemeMaster.SchemeCategory.Name);
          const rating = fund.OverallRating || fund.performanceRating || 0;
          const isPositive = fund.Return1yr >= 0;

          return (
            <div
              key={fund.id}
              className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient bar on left */}
              <div className={`absolute left-0 top-0 h-full w-1 ${isPositive ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-gradient-to-b from-red-400 to-rose-500'}`}></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent" />
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {fund.SchemeMaster.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600">
                        {fund.SchemeMaster.SchemeSubcategory.Name}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRiskColor(
                          fund.SchemeMaster.riskLevel
                        )} text-white font-semibold`}
                      >
                        {fund.SchemeMaster.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <div
                      className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {isPositive ? '+' : ''}
                      {fund.Return1yr.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatAUM(fund.AUM)} AUM
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({rating}.0)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const DataInitializer = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeData = () => {
      const encodedData = searchParams.get('data');

      if (encodedData) {
        try {
          const fullData = JSON.parse(decodeURIComponent(encodedData));
        
          setLS(USER_DATA, fullData);
       
        } catch (error) {
          console.error(' Error parsing partner data:', error);
        }
      } else {
        console.log('ℹ No data parameter found in URL, using existing USER_DATA');
      }
    };

    initializeData();
  }, [searchParams]);

  return null;
};

// Main Dashboard Component
const PartnerDashboardComponent = () => {
  const searchParams = useSearchParams();
  const { showAlert, isChecking, handleContinueOnboarding, handleCloseAlert } = useOnboardingAlert();

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const fullData = JSON.parse(decodeURIComponent(encodedData));
      
        removeLS(USER_DATA);
        setLS(USER_DATA, fullData);
      } catch (error) {
        console.error('Error initializing partner data:', error);
      }
    }
  }, [searchParams]);

  const userData = getLS(USER_DATA);
  const userTypeid = userData?.userTypeId ?? 0;

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 m-0 p-0">
      {/* Enhanced CSS animations */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>

      {showAlert && (
        <OnboardingAlertPopup
          onClose={handleCloseAlert}
          onContinue={handleContinueOnboarding}
          isLoading={isChecking}
        />
      )}

      <DataInitializer />
      <main className="flex-1 bg-transparent m-0 p-0 w-full">
        <div className="flex-1 overflow-y-auto w-full">
          <div className="bg-transparent rounded-2xl min-h-full"></div>
          <AlertBanner />
          <div className="w-full m-0 p-0">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">

              {/* Three equal-height cards row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Quick Actions - Left */}
                <div className="lg:col-span-1">
                  <QuickActions />
                </div>

                {/* Partner Profile - Middle */}
                <div className="lg:col-span-1">
                  <PartnerProfileCard />
                </div>

                {/* Business Overview Stats - Right */}
                <div className="lg:col-span-1">
                  <BusinessOverviewStats />
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <LiveMarketOverview />
                    <CalendarWidget userTypeId={userTypeid} />
                  </div>
                </div>
                <div className="space-y-8">
                  <MutualFundPerformance />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { title } = usePageTitle();

  const userData = getLS(USER_DATA);
  const user = getLS(PROD_DATA)?.user;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }, []);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 to-gray-950" data-theme="light">

      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>

      <div
        className={`fixed z-50 top-0 h-screen bg-gradient-to-br from-gray-900 to-gray-950 lg:hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? "left-[-100%]" : "left-0 w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>

      <main className="flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-white to-gray-50 lg:rounded-l-3xl shadow-2xl w-full">
        <Header
          toggleSidebar={toggleSidebar}
          title={title}
          collapsed={sidebarCollapsed}
          userData={user}
        />
        <div className="flex-1 overflow-y-auto w-full">
          <div className="bg-transparent rounded-2xl min-h-full w-full">
            <PartnerDashboardComponent />
          </div>
        </div>
      </main>
    </div>
  );
}