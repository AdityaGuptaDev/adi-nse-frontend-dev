"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import { publicPathName } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { IndianRupee, Languages, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Sun, 
  Moon, 
  ChevronDown, 
  UserPlus, 
  Users, 
  Globe, 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Building,
  Shield,
  BarChart3,
  Network,
  Target,
  Clock,
  Eye,
  CheckCircle,
  ArrowRight,
  Award,
  Lock,
  PieChart,
  Earth,
  Calculator,
  TrendingUp as TrendingUpIcon,
  Star,
  Zap,
  Crown,
  Rocket
} from "lucide-react";

function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particleCount, setParticleCount] = useState(0);
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);
  const [calculatorType, setCalculatorType] = useState<'sip' | 'lumpsum'>('sip');
  const [sipAmount, setSipAmount] = useState(5000);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [calculatedValue, setCalculatedValue] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);
    document.documentElement.classList.toggle('dark', initialDarkMode);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSignupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const interval = setInterval(() => {
      setParticleCount(prev => (prev < 50 ? prev + 1 : 50));
    }, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            if (section) {
              setActiveSection(Number(section));
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 11 ? 0 : prev + 1));
    }, 3000); // Change slide every 3 seconds (faster)

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateReturns();
  }, [sipAmount, lumpsumAmount, returnRate, timePeriod, calculatorType]);

  const calculateReturns = () => {
    if (calculatorType === 'sip') {
      // SIP Calculation: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
      const monthlyRate = returnRate / 100 / 12;
      const months = timePeriod * 12;
      const futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      setCalculatedValue(Number(futureValue.toFixed(0)));
    } else {
      // Lumpsum Calculation: FV = P * (1 + r)^n
      const futureValue = lumpsumAmount * Math.pow(1 + returnRate / 100, timePeriod);
      setCalculatedValue(Number(futureValue.toFixed(0)));
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleBecomeInvestor = () => router.push("/investorOnboarding");
  const handleBecomePartner = () => router.push("/partnerOnboarding");
  const handleBecomeBC = () => router.push("/bcOnboarding");
  const login = () => router.push("/login");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const topFunds = [
    {
      name: "Parag Parikh Flexi Cap Fund",
      category: "Flexi Cap",
      returns: "23.8%",
      risk: "Moderately High",
      rating: 4.9,
      aum: "₹54,872 Cr",
      minInvestment: "₹1,000",
      icon: <Crown className="h-6 w-6" />,
      color: "from-blue-600 to-cyan-600",
      badge: "Consistent Performer",
      description: "Multi-cap fund with focus on value investing and international diversification",
      expenseRatio: "0.58%",
      launchYear: "2013",
      fundManager: "Rajeev Thakkar",
      returns3Y: "21.4%",
      returns5Y: "19.8%"
    },
    {
      name: "Quant Small Cap Fund",
      category: "Small Cap",
      returns: "39.2%",
      risk: "Very High",
      rating: 4.7,
      aum: "₹18,456 Cr",
      minInvestment: "₹5,000",
      icon: <Rocket className="h-6 w-6" />,
      color: "from-purple-600 to-pink-600",
      badge: "High Growth",
      description: "Algorithm-driven small cap fund with aggressive growth strategy",
      expenseRatio: "0.59%",
      launchYear: "2018",
      fundManager: "Sandeep Tandon",
      returns3Y: "42.1%",
      returns5Y: "35.7%"
    },
    {
      name: "ICICI Prudential Bluechip Fund",
      category: "Large Cap",
      returns: "18.6%",
      risk: "Moderate",
      rating: 4.8,
      aum: "₹42,189 Cr",
      minInvestment: "₹5,000",
      icon: <Shield className="h-6 w-6" />,
      color: "from-green-600 to-emerald-600",
      badge: "Large Cap Leader",
      description: "India's largest large-cap fund with proven track record across market cycles",
      expenseRatio: "0.76%",
      launchYear: "2008",
      fundManager: "Manish Gunwani",
      returns3Y: "17.2%",
      returns5Y: "16.5%"
    }
  ];

  const roleOptions = [
    {
      label: "Investor",
      description: "Start your investment journey with expert-guided portfolios",
      icon: <TrendingUp className="h-12 w-12" />,
      onClick: handleBecomeInvestor,
      features: ["Personalized Portfolio", "Expert Advisory", "Real-time Tracking"],
      gradient: "from-blue-600 to-cyan-600",
      stats: "10K+ Active Investors"
    },
    {
      label: "Partner",
      description: "Join our elite network of financial advisors and partners",
      icon: <Users className="h-12 w-12" />,
      onClick: handleBecomePartner,
      features: ["Revenue Sharing", "Client Management", "Training Programs"],
      gradient: "from-purple-600 to-pink-600",
      stats: "200+ Partners"
    },
    {
      label: "BC Partner",
      description: "Extend financial services to underserved communities",
      icon: <Globe className="h-12 w-12" />,
      onClick: handleBecomeBC,
      features: ["Rural Outreach", "Commission Based", "Support System"],
      gradient: "from-green-600 to-emerald-600",
      stats: "50+ BC Partners"
    }
  ];

  const features = [
    {
      icon: <Building className="h-10 w-10" />,
      title: "Regulatory Excellence",
      description: "Full compliance with SEBI regulations and international financial standards",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Advanced Security",
      description: "Multi-layered security protocols with institutional-grade protection",
      gradient: "from-green-600 to-blue-600"
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Smart Analytics",
      description: "Advanced data insights and predictive market analysis tools",
      gradient: "from-orange-600 to-red-600"
    },
    {
      icon: <Earth className="h-10 w-10" />,
      title: "Global Reach",
      description: "Access to diversified investment opportunities across global markets",
      gradient: "from-cyan-600 to-blue-600"
    }
  ];

  const metrics = [
    { value: "98%", label: "Client Satisfaction", change: "+2.1%" },
    { value: "₹850Cr+", label: "Assets Managed", change: "+15.3%" },
    { value: "12.8%", label: "Avg. Annual Returns", change: "+1.2%" },
    { value: "<0.01%", label: "Security Incidents", change: "0%" }
  ];

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" }
    ],
    products: [
      { name: "Wealth Management", href: "/wealth" },
      { name: "Portfolio Advisory", href: "/advisory" },
      { name: "AI Insights", href: "/ai" },
      { name: "Market Research", href: "/research" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" }
    ],
    regulatory: [
      { name: "SEBI Regulations", href: "/sebi" },
      { name: "Disclosures", href: "/disclosures" },
      { name: "Compliance", href: "/compliance" },
      { name: "Investor Charter", href: "/charter" }
    ]
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50 text-[#F9FAFB]'
    }`}>
      
      {/* Enhanced Background */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 30%, #f0f9ff 70%, #e0f2fe 100%)'
        }}
      />

      {/* Subtle Grid Pattern for Light Mode */}
      {!isDarkMode && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      )}

      {/* Mouse Tracker Glow */}
      <div 
        className="fixed pointer-events-none z-0 w-96 h-96 rounded-full blur-3xl transition-all duration-100"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: isDarkMode 
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)'
        }}
      />

      {/* Navigation */}
      <nav className={`fixed w-full py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-lg z-50 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'border-gray-800/50 bg-gray-900/80' 
          : 'border-blue-100/50 bg-[#111111]/90 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center space-x-3 group cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="w-2 h-2 bg-blue-600 rounded-full absolute -top-0.5 -right-0.5 animate-ping"></div>
              <TrendingUp className="h-7 w-7 text-blue-600 transition-all duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              VEDANT ASSET
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-sm'
              }`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <CustomButton
                onClick={() => setIsSignupDropdownOpen(!isSignupDropdownOpen)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-blue-500/25"
              >
                <UserPlus className="h-4 w-4" />
                <span>Signup</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isSignupDropdownOpen ? 'rotate-180' : ''}`} />
              </CustomButton>

              {/* Dropdown Menu */}
              {isSignupDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border backdrop-blur-md z-50 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-[#111111] border-blue-100 shadow-xl'
                }`}>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleBecomePartner();
                        setIsSignupDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-200' 
                          : 'hover:bg-blue-50 text-[#E5E7EB] border border-transparent hover:border-blue-200'
                      }`}
                    >
                      <Users className="h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-semibold">Become a Partner</div>
                        <div className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                          Join as financial advisor
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleBecomeBC();
                        setIsSignupDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-200' 
                          : 'hover:bg-blue-50 text-[#E5E7EB] border border-transparent hover:border-blue-200'
                      }`}
                    >
                      <Globe className="h-5 w-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold">Become a BC</div>
                        <div className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                          Business correspondent
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleBecomeInvestor();
                        setIsSignupDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-200' 
                          : 'hover:bg-blue-50 text-[#E5E7EB] border border-transparent hover:border-blue-200'
                      }`}
                    >
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold">Continue as Investor</div>
                        <div className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                          Start investing
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <CustomButton
              onClick={login}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Login
            </CustomButton>
          </div>
        </div>
      </nav>

      {/* Multi-Slide Hero Section with 12 Slides */}
      <section 
        ref={heroRef}
        data-section="0"
        className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-800' 
            : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
        }`} />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
            isDarkMode ? 'bg-blue-500' : 'bg-blue-200'
          } animate-pulse`} />
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-cyan-500' : 'bg-cyan-200'
          } animate-pulse delay-1000`} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Simple Trust Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full mb-8 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">Trusted by 50,000+ Indian Families</span>
          </div>

          {/* Main Slides Container */}
          <div className="relative h-96 mb-12">
            {/* Slide 1: Start Small */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 0 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Start Small
                </span>
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Grow Big
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Begin with just <span className="font-semibold text-green-600">₹500</span>. 
                No big money needed to start.
              </p>
            </div>

            {/* Slide 2: Easy Process */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 1 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Very Easy
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  To Use
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Simple steps. Easy to understand. No confusion.
              </p>
            </div>

            {/* Slide 3: Local Help */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 2 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Local Help
                </span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Available
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Talk to advisors near you. They speak your language.
              </p>
            </div>

            {/* Slide 4: Government Approved */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 3 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Government
                </span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Approved
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                SEBI registered. Your money is safe with us.
              </p>
            </div>

            {/* Slide 5: More Than Bank */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 4 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  More Money
                </span>
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Than Bank
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Earn more than bank FD. Grow your money faster.
              </p>
            </div>

            {/* Slide 6: Monthly Income */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 5 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Monthly
                </span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Income
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Get regular monthly payments. Good for extra money.
              </p>
            </div>

            {/* Slide 7: Save Tax */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 6 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Pay Less
                </span>
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Tax
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Save up to ₹1.5 Lakh tax. Keep more of your money.
              </p>
            </div>

            {/* Slide 8: Any Device */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 7 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Use Phone
                </span>
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Or Computer
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Works on mobile. Works on computer. Easy for all.
              </p>
            </div>

            {/* Slide 9: Slow Internet OK */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 8 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Slow Internet
                </span>
                <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  No Problem
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Works with slow network. Good for village areas.
              </p>
            </div>

            {/* Slide 10: No Hidden Charges */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 9 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  No Hidden
                </span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Charges
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Clear fees. No surprise costs. You know everything.
              </p>
            </div>

            {/* Slide 11: For Future */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 10 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Secure Your
                </span>
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Future
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Plan for children's education. Plan for retirement.
              </p>
            </div>

            {/* Slide 12: Start Today */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              activeSlide === 11 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className={`block ${isDarkMode ? 'text-white' : 'text-[#F9FAFB]'}`}>
                  Start Today
                </span>
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Grow Tomorrow
                </span>
              </div>
              <p className={`text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-[#9CA3AF]'
              }`}>
                Don't wait. Begin now. Your future self will thank you.
              </p>
            </div>
          </div>

          {/* Slide Indicators - Compact for 12 slides */}
          <div className="flex justify-center space-x-1 mb-12 flex-wrap max-w-2xl mx-auto">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? 'bg-blue-600 w-4'
                    : isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setActiveSlide((prev) => (prev === 0 ? 11 : prev - 1))}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/50 hover:bg-gray-700 text-[#6B7280] hover:text-white' 
              : 'bg-[#111111]/60 hover:bg-[#111111] text-[#9CA3AF] hover:text-[#F9FAFB] shadow-lg'
          }`}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button 
          onClick={() => setActiveSlide((prev) => (prev === 11 ? 0 : prev + 1))}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/50 hover:bg-gray-700 text-[#6B7280] hover:text-white' 
              : 'bg-[#111111]/60 hover:bg-[#111111] text-[#9CA3AF] hover:text-[#F9FAFB] shadow-lg'
          }`}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Top Performing Funds Section */}
      <section 
        data-section="2"
        className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <CustomText className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Top Performing Funds
            </CustomText>
            <CustomText className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Discover our highest-rated investment opportunities with proven track records and exceptional returns
            </CustomText>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {topFunds.map((fund, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl p-6 transition-all duration-500 border backdrop-blur-md cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800/30 border-gray-700 hover:border-cyan-500/50' 
                    : 'bg-[#111111]/60 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl'
                } hover:shadow-2xl transform hover:-translate-y-2`}
                onClick={handleBecomeInvestor}
              >
                {/* Badge */}
                <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${fund.color}`}>
                  {fund.badge}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${fund.color} text-white`}>
                    {fund.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      {fund.rating}
                    </span>
                  </div>
                </div>

                <CustomText className="text-lg font-black mb-2">
                  {fund.name}
                </CustomText>
                
                <div className={`text-sm mb-4 ${
                  isDarkMode ? 'text-[#6B7280]' : 'text-slate-600'
                }`}>
                  {fund.category} • {fund.risk} Risk
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'
                    }`}>
                      Annual Returns
                    </div>
                    <div className="text-lg font-black text-green-600">
                      {fund.returns}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'
                    }`}>
                      Fund Size
                    </div>
                    <div className="text-sm font-semibold">
                      {fund.aum}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'
                  }`}>
                    Min. Investment: {fund.minInvestment}
                  </span>
                  <CustomButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBecomeInvestor();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Invest
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section 
        id="roles"
        data-section="3"
        className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <CustomText className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Choose Your Path
            </CustomText>
            <CustomText className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Join India's fastest growing financial ecosystem with opportunities tailored for every ambition
            </CustomText>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roleOptions.map((role, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl p-8 transition-all duration-500 border backdrop-blur-md cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800/30 border-gray-700 hover:border-cyan-500/50' 
                    : 'bg-[#111111]/60 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl'
                } hover:shadow-2xl transform hover:-translate-y-2`}
                onClick={role.onClick}
              >
                {/* Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`flex justify-center mb-6 ${
                    role.label === "Investor" ? "text-blue-600" :
                    role.label === "Partner" ? "text-purple-600" : "text-green-600"
                  }`}>
                    {role.icon}
                  </div>
                  
                  <CustomText className="text-2xl font-black text-center mb-4">
                    {role.label}
                  </CustomText>
                  
                  <CustomText className={`text-center mb-6 leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    {role.description}
                  </CustomText>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {role.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className={`flex items-center transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className={`text-center px-3 py-2 rounded-xl mb-6 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700/50' 
                      : 'bg-blue-50 border border-blue-100'
                  }`}>
                    <CustomText className={`text-sm font-semibold ${
                      isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {role.stats}
                    </CustomText>
                  </div>

                  {/* CTA Button */}
                  <CustomButton
                    onClick={(e) => {
                      e.stopPropagation();
                      role.onClick();
                    }}
                    className={`w-full py-4 bg-gradient-to-r ${role.gradient} hover:shadow-2xl text-white rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-white/20`}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator Section */}
      {/* Investment Calculator Section - Compact with Uniform Height */}
      <section 
        data-section="1"
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <CustomText className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Plan Your Wealth
            </CustomText>
            <CustomText className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              See how your investments can grow with our interactive calculator
            </CustomText>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Wealth Simulator Controls */}
            <div className={`rounded-2xl p-6 backdrop-blur-md border transition-colors duration-300 flex flex-col ${
              isDarkMode 
                ? 'bg-gray-800/30 border-gray-700' 
                : 'bg-[#111111]/60 border-blue-100 shadow-lg'
            }`}>
              {/* Calculator Type Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <CustomText className="text-xl font-black">Wealth Simulator</CustomText>
                </div>
                <div className="flex bg-blue-100 rounded-lg p-1 text-sm">
                  <button
                    onClick={() => setCalculatorType('sip')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all duration-300 ${
                      calculatorType === 'sip'
                        ? 'bg-blue-600 text-white shadow-md'
                        : isDarkMode ? 'text-gray-300' : 'text-blue-600'
                    }`}
                  >
                    SIP
                  </button>
                  <button
                    onClick={() => setCalculatorType('lumpsum')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all duration-300 ${
                      calculatorType === 'lumpsum'
                        ? 'bg-blue-600 text-white shadow-md'
                        : isDarkMode ? 'text-gray-300' : 'text-blue-600'
                    }`}
                  >
                    Lumpsum
                  </button>
                </div>
              </div>

              {/* Input Controls - Fill remaining space */}
              <div className="space-y-6 flex-1">
                {/* Investment Amount */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <label className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      {calculatorType === 'sip' ? 'Monthly Investment' : 'One-time Investment'}
                    </label>
                    <span className={`text-lg font-black ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {calculatorType === 'sip' 
                        ? formatCurrency(sipAmount) 
                        : formatCurrency(lumpsumAmount)
                      }
                    </span>
                  </div>
                  <input
                    type="range"
                    min={calculatorType === 'sip' ? 1000 : 10000}
                    max={calculatorType === 'sip' ? 100000 : 5000000}
                    step={calculatorType === 'sip' ? 1000 : 10000}
                    value={calculatorType === 'sip' ? sipAmount : lumpsumAmount}
                    onChange={(e) => calculatorType === 'sip' 
                      ? setSipAmount(Number(e.target.value))
                      : setLumpsumAmount(Number(e.target.value))
                    }
                    className="w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg appearance-none cursor-pointer compact-slider"
                  />
                </div>

                {/* Return Rate */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <label className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      Expected Returns
                    </label>
                    <span className="text-lg font-black text-green-600">
                      {returnRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="25"
                    value={returnRate}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg appearance-none cursor-pointer compact-slider"
                  />
                </div>

                {/* Time Period */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <label className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      Time Period
                    </label>
                    <span className="text-lg font-black text-purple-600">
                      {timePeriod} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg appearance-none cursor-pointer compact-slider"
                  />
                </div>
              </div>

              {/* Quick Presets - Fixed at bottom */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-[#2A2A2A] dark:border-gray-600">
                <button
                  onClick={() => {
                    setCalculatorType('sip');
                    setSipAmount(5000);
                    setReturnRate(12);
                    setTimePeriod(10);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  Starter
                </button>
                <button
                  onClick={() => {
                    setCalculatorType('sip');
                    setSipAmount(25000);
                    setReturnRate(14);
                    setTimePeriod(15);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  Growth
                </button>
                <button
                  onClick={() => {
                    setCalculatorType('sip');
                    setSipAmount(50000);
                    setReturnRate(12);
                    setTimePeriod(20);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  Wealth
                </button>
                <button
                  onClick={() => {
                    setCalculatorType('lumpsum');
                    setLumpsumAmount(500000);
                    setReturnRate(15);
                    setTimePeriod(8);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                  }`}
                >
                  Lumpsum
                </button>
              </div>
            </div>

            {/* Right Panel - Investment Summary */}
            <div className="flex flex-col space-y-4">
              {/* Main Results Card */}
              <div className={`rounded-2xl p-6 backdrop-blur-md border transition-colors duration-300 flex-1 flex flex-col ${
                isDarkMode 
                  ? 'bg-gray-800/30 border-gray-700' 
                  : 'bg-[#111111]/60 border-blue-100 shadow-lg'
              }`}>
                <CustomText className="text-lg font-black mb-4">
                  Investment Summary
                </CustomText>
                
                <div className="space-y-4 flex-1">
                  {/* Progress Visualization */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDarkMode ? 'text-[#6B7280]' : 'text-slate-600'}>
                        Amount Invested
                      </span>
                      <span className="font-semibold">
                        {calculatorType === 'sip' 
                          ? formatCurrency(sipAmount * timePeriod * 12)
                          : formatCurrency(lumpsumAmount)
                        }
                      </span>
                    </div>
                    
                    <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (calculatorType === 'sip' 
                            ? (sipAmount * timePeriod * 12) 
                            : lumpsumAmount
                          ) / calculatedValue * 100)}%`
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDarkMode ? 'text-[#6B7280]' : 'text-slate-600'}>
                        Wealth Created
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(calculatedValue - (
                          calculatorType === 'sip' 
                            ? sipAmount * timePeriod * 12 
                            : lumpsumAmount
                        ))}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (calculatedValue - (
                            calculatorType === 'sip' 
                              ? sipAmount * timePeriod * 12 
                              : lumpsumAmount
                          )) / calculatedValue * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Final Amount Display */}
                  <div className="text-center mt-4 pt-4 border-t border-[#2A2A2A] dark:border-gray-600">
                    <div className={`text-sm mb-1 ${isDarkMode ? 'text-[#6B7280]' : 'text-slate-600'}`}>
                      Future Value in {timePeriod} years
                    </div>
                    <div className="text-2xl font-black text-green-600 mb-2">
                      {formatCurrency(calculatedValue)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-500'}`}>
                      {((calculatedValue / (
                        calculatorType === 'sip' 
                          ? sipAmount * timePeriod * 12 
                          : lumpsumAmount
                      ) - 1) * 100).toFixed(1)}% total returns
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Comparison & CTA */}
              <div className="grid grid-cols-2 gap-4">
                {/* Comparison Card */}
                <div className={`rounded-2xl p-4 text-center flex flex-col justify-center ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-yellow-50'
                }`}>
                  <div className="text-yellow-600 text-xs font-semibold mb-1">vs Savings</div>
                  <div className="text-lg font-black text-yellow-700 mb-1">
                    {formatCurrency(calculatedValue - (
                      calculatorType === 'sip' 
                        ? sipAmount * timePeriod * 12 * 1.04 
                        : lumpsumAmount * Math.pow(1.04, timePeriod)
                    ))}
                  </div>
                  <div className="text-[10px] opacity-70">Extra gains</div>
                </div>

                {/* CTA Button */}
                <CustomButton
                  onClick={handleBecomeInvestor}
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 text-sm min-h-[80px]"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Start Investing</span>
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .compact-slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          
          .compact-slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <CustomText className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Ready to Transform Your Future?
          </CustomText>
          <CustomText className={`text-xl mb-12 max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-slate-600'
          }`}>
            Join thousands of successful investors and partners who trust Vedant Asset for their financial growth.
          </CustomText>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <CustomButton
              onClick={handleBecomeInvestor}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/30 border border-blue-500/20 text-lg"
            >
              Start Investing
            </CustomButton>

            <div className="flex gap-4">
              <CustomButton
                onClick={handleBecomePartner}
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-500/20"
              >
                Become Partner
              </CustomButton>
              
              <CustomButton
                onClick={handleBecomeBC}
                className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-500/20"
              >
                Become BC
              </CustomButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-slate-50'
      } border-t ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  VEDANT ASSET
                </span>
              </div>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                Building India's most trusted financial ecosystem with cutting-edge technology 
                and decades of expertise in wealth management and investment advisory.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <button
                    key={index}
                    className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-blue-500 text-gray-300 hover:text-white' 
                        : 'bg-[#111111] hover:bg-blue-500 text-slate-600 hover:text-white shadow-sm border border-blue-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links], index) => (
              <div key={category}>
                <h3 className={`text-lg font-semibold mb-6 capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {category}
                </h3>
                <div className="space-y-3">
                  {links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      className={`block transition-colors duration-300 hover:text-blue-600 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className={`py-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>
                  contact@vedantasset.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>
                  +91 1800-123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>
                  Mumbai, India
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`py-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <span className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'}`}>
                © 2025 Vedant Asset. All rights reserved.
              </span>
              <div className="flex space-x-6">
                <span className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'}`}>
                  <Award className="h-4 w-4 inline mr-1" />
                  SEBI Registered
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'}`}>
                  <Shield className="h-4 w-4 inline mr-1" />
                  ISO 27001 Certified
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'}`}>
                  <PieChart className="h-4 w-4 inline mr-1" />
                  Building Financial Futures
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Progress Indicator */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-4">
          {[0, 1, 2, 3, 4].map((section) => (
            <button
              key={section}
              onClick={() => {
                const element = document.querySelector(`[data-section="${section}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === section 
                  ? 'bg-cyan-500 scale-125 shadow-lg' 
                  : isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-blue-200 hover:bg-blue-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;