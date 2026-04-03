"use client";
// Top Performing Schemes Component

import CustomButton from "@/commonUI/Button";
import FullPageLoader from "@/commonUI/FullPageLoader";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { toFixedDataForReturn, USER_DATA } from "@/utils/constants";
import { convertNumberIndian, getLS, handleServerError, toastAlert } from "@/utils/helpers";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { IoCartOutline, IoTriangle } from "react-icons/io5";
import { MdOutlineTrendingUp, MdOutlineStar } from "react-icons/md";
import { RiSparklingLine } from "react-icons/ri";

// Golden Black Theme
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
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)"
};

type Props = {
  data: any;
  onSchemeClick: (scheme: any) => void;
};

function TopPerformingSchemes({ data, onSchemeClick }: Props) {
  let router = useRouter();

  const [activeTab, setActiveTab] = useState(data?.[0]?.categoryName || "Equity");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [navegateLoader, setNavigateLoader] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [showSipPopup, setShowSipPopup] = useState(false);
  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

  const [sliderRefTopPerformingScheme, instanceRef] = useKeenSlider({
    breakpoints: {
      "(min-width: 200px)": {
        slides: { perView: 1, spacing: 5 },
      },
      "(min-width: 768px)": {
        slides: {
          perView: 3,
          spacing: 16
        },
      },
    },
    loop: true,
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const schemes = data.length > 0 ? data : [];
  const activeClass = schemes.find((fc: any) => fc.categoryName === activeTab) || schemes[0];

  const onChangeViewAll = () => {
    setNavigateLoader(true);
    router.push(`/top-performing-scheme-list`);
    setNavigateLoader(false);
  };

  const handleNavigateFundDetail = (item: any) => {
    setNavigateLoader(true);
    router.push(
      `/fund-detail?id=${item?.SchemeMaster?.id}&tab=NAV`
    );
    setNavigateLoader(false);
  };

  const addToCart = async (schemeId: number, e: any) => {
    e.stopPropagation();
    try {
      const userData: any = getLS(USER_DATA);

      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeId,
        trans_type: 1,
      };

      let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
      if (addCartData.data.data) {
        toastAlert("success", "Added To Cart");
        setCartCounter(cartCounter + 1);
      } else {
        toastAlert("info", "Unable to add in cart, please try again later!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  // Color mapping for risk levels with theme colors
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      <FullPageLoader
        isVisible={navegateLoader}
        message="Processing..."
      />
      
      <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden">
        {/* Header Section - Golden Theme */}
        <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                <MdOutlineTrendingUp className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <h2 className="text-lg font-semibold text-[#F9FAFB]">Top Performing Schemes</h2>
            </div>
            
            <CustomButton
              className="px-3 py-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-colors text-xs font-medium shadow-sm"
              onClick={() => onChangeViewAll()}
            >
              <span className="flex items-center gap-1">
                View All <FaAngleRight className="text-xs" />
              </span>
            </CustomButton>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="px-4 pt-4 pb-2 border-b border-[#2A2A2A]">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {schemes.map((fundClass: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveTab(fundClass.categoryName)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeTab === fundClass.categoryName
                    ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white shadow-sm"
                    : "bg-[#1F1A1A] text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-[#F9FAFB]"
                }`}
              >
                {fundClass.categoryName}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes List - Dark Theme */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {activeClass?.scheme.length > 0 ? (
            <div className="space-y-3">
              {activeClass?.scheme.map((scheme: any, index: number) => (
                <div 
                  key={index}
                  className="p-3 bg-[#1F1A1A] rounded-lg hover:bg-[#2A2A2A] transition-all duration-200 border border-[#2A2A2A] cursor-pointer group"
                  onClick={() => handleNavigateFundDetail(scheme)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#B45309] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {scheme?.SchemeMaster?.ms_fullname?.charAt(0) || 'F'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#F9FAFB] truncate group-hover:text-[#F59E0B] transition-colors">
                          {scheme?.SchemeMaster?.ms_fullname || 'Scheme Name'}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          {scheme?.SchemeMaster?.SchemeCategory?.Name || 'Mutual Fund'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getRiskColor(scheme?.SchemeMaster?.riskLevel)}`}>
                      {scheme?.SchemeMaster?.riskLevel || 'Moderate'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-[#9CA3AF]">1Y Return</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <IoTriangle className={`w-3 h-3 ${scheme?.Return1yr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                          <span className={`text-sm font-semibold ${scheme?.Return1yr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {toFixedDataForReturn(scheme?.Return1yr)}
                          </span>
                        </div>
                      </div>
                      
                      {scheme?.AUM && (
                        <div>
                          <p className="text-xs text-[#9CA3AF]">AUM</p>
                          <p className="text-xs font-medium text-[#F9FAFB] mt-0.5">
                            ₹{convertNumberIndian(scheme.AUM)}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs text-[#9CA3AF]">Rating</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <MdOutlineStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < (scheme?.OverallRating || 0)
                                  ? 'text-[#F59E0B] fill-current'
                                  : 'text-[#2A2A2A]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-[#9CA3AF] text-sm">
              <div className="text-center">
                <RiSparklingLine className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                <p>No schemes available in this category</p>
              </div>
            </div>
          )}
        </div>

        {/* Slide Indicators for Mobile */}
        {loaded && instanceRef.current && (
          <div className="flex justify-center gap-2 py-3 border-t border-[#2A2A2A] md:hidden">
            {[
              ...Array(instanceRef.current.track.details.slides.length).keys(),
            ].map((idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    instanceRef.current?.moveToIdx(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    currentSlide === idx
                      ? "w-6 bg-gradient-to-r from-[#F59E0B] to-[#B45309]"
                      : "w-1.5 bg-[#2A2A2A]"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default TopPerformingSchemes;