"use client";
// Top Performing Schemes Component

import CustomButton from "@/commonUI/Button";
import CustomBackButton from "@/commonUI/CustomBackButton";
import FullPageLoader from "@/commonUI/FullPageLoader";
import CustomText from "@/commonUI/Text";
import InvestorPopup from "@/components/fund-explore/investor";
import PurchaseDetailPopup from "@/components/fund-explore/purchaseDetail";
import SipPopup from "@/components/fund-explore/sipDetail";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { schemeColors, toFixedDataForReturn, USER_DATA } from "@/utils/constants";
import { convertNumberIndian, getLS, handleServerError, RISK_COLOR, toastAlert } from "@/utils/helpers";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoCartOutline, IoTriangle } from "react-icons/io5";


type Props = {
  data: any;
  onSchemeClick: (scheme: any) => void;
};

function TopPerformingSchemes({ data, onSchemeClick }: Props) {
  // Mock data for demonstration


  let router = useRouter();

  const [activeTab, setActiveTab] = useState(data?.[0]?.categoryName || "Equity");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [navegateLoader, setNavigateLoader] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [showSipPopup, setShowSipPopup] = useState(false);
  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);
  const [groupLeaderId, setGroupLeaderId] = useState(0)

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
    // slides: {
    //     perView: 2,
    //     spacing: 15,
    //     },
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
  // const schemes = mockData;

  const activeClass = schemes.find((fc: any) => fc.categoryName === activeTab) || schemes[0];

  const onChangeViewAll = () => {
    setNavigateLoader(true);
    router.push(`/top-performing-scheme-list`)
    setNavigateLoader(false);
  }

  const handleNavigateFundDetail = (item: any) => {
    setNavigateLoader(true);
    router.push(
      `/fund-detail?id=${item?.SchemeMaster?.id}&tab=NAV`
    );
    setNavigateLoader(false);
  };



  const addToCart = async (schemeId: number) => {
    try {
      const userData: any = getLS(USER_DATA);
      // console.log(userData, "userDatauserData");

      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeId,
        trans_type: 1,
      };
      console.log(CartObj)

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


  return (
    <>
      <FullPageLoader
        isVisible={navegateLoader}
        message="Processing..."
      />
      <div className="bg-white">
        {/* <div className="flex justify-between px-3">
          <div className="justify-center mt-3">
            <CustomButton
              className="flex text-proses-secondary normal-case"
              onClick={() => router.back()}
            >
              <IoMdArrowRoundBack className="h-4 w-4 mr-1" />
              Back
            </CustomButton>
          </div>
        </div> */}

        
        <div className="flex items-center justify-between mb-4">
          <div className="justify-center flex  items-center gap-5  mt-0">
           <div className="justify-center">
              <CustomBackButton
                
                onClick={() => window.history.back()}
              >
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
               
              </CustomBackButton>
            </div>
             <CustomText className="text-lg font-montserrat font-semibold text-gray-900">
            Top Performing Schemes
          </CustomText>
          </div>
          
         
          <CustomButton
            className="p-0 h-auto min-h-0 !text-secondary-content !bg-white"
            onClick={() => onChangeViewAll()}
          >
            View All <span><FaAngleRight /></span>
          </CustomButton>
        </div>

        <div className="flex gap-0 mb-4 border-b border-gray-200">
          <div role="tablist" className="tabs tabs-border">
            {schemes.map((fundClass: any, index: number) => (
              <a role="tab" key={index}
                className={`tab transition-all ${activeTab === fundClass.categoryName
                  ? " tab-active font-bold text-primary border-primary"
                  : "text-gray-600 hover:text-gray-800 border-transparent"
                  }`} onClick={() => setActiveTab(fundClass.categoryName)}>{fundClass.categoryName}</a>
            ))}
          </div>
        </div>

        <div className="">
          <div className="relative">
            {/* <div ref={sliderRefTopPerformingScheme} className="keen-slider"> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {activeClass?.scheme.length > 0 ? (
                activeClass?.scheme.map((scheme: any, index: number) => (
                  // <div className="keen-slider__slide" key={scheme.id}>
                  <div key={index}>
                    <div
                      className="bg-white border border-gray-200 rounded-xl p-4 h-full hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                      {/* Scheme Header with Icon */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-8 h-8  rounded-full flex items-center justify-center flex-shrink-0 ${schemeColors[index % schemeColors.length].text} ${schemeColors[index % schemeColors.length].bg}`}>
                          <div>
                            {/* <img src={`${publicPathName}/${scheme.img}`} /> */}
                            {scheme?.SchemeMaster?.ms_fullname.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0" onClick={(e: any) =>
                          handleNavigateFundDetail(scheme)
                        }>
                          {/* <Link href={`/fund-detail?id=${scheme?.SchemeMaster?.id}`}> */}
                          <CustomText className="font-semibold text-secondary-content text-base line-clamp-2 cursor-pointer">
                            {scheme?.SchemeMaster?.ms_fullname}
                          </CustomText>
                          {/* </Link> */}
                        </div>
                      </div>

                      {/* Returns Section */}
                      <div className="mb-3 flex justify-between items-center">
                        <div className="flex items-baseline gap-2 mb-1">
                          <IoTriangle className="text-green-600 w-3 h-3 mt-1" />
                          <CustomText className="text-base font-bold text-green-600">
                            {toFixedDataForReturn(scheme?.Return1yr)}
                          </CustomText>
                          <CustomText className="text-xs text-gray-500">
                            p.a
                          </CustomText>
                        </div>
                        <CustomText className="text-xs text-gray-500">
                          (1Year)
                        </CustomText>
                      </div>

                      {/* Benchmark Section */}
                      <div className="mb-3">
                        <CustomText className="text-xs text-gray-500 mb-1">
                          {/* Benchmark - Category */}
                          Category
                        </CustomText>
                        <div className="flex justify-between items-center">
                          <CustomText className="text-base text-gray-800 font-medium leading-tight pr-1.5">
                            {scheme?.SchemeMaster?.SchemeCategory?.Name} - {scheme?.SchemeMaster?.SchemeSubcategory?.Name}
                          </CustomText>
                          <div className="flex items-center gap-1">
                            {/* <FiTrendingUp className="text-blue-600 w-3 h-3" /> */}
                            <IoTriangle className="text-green-600 w-3 h-3" />
                            <CustomText className="text-base font-semibold text-green-600">
                              {toFixedDataForReturn(scheme.categoryReturnAvg)}
                            </CustomText>
                          </div>
                        </div>
                      </div>
                      </div>
                      <div>
                      {/* Risk Rating and Investment */}
                      <div className="flex items-center justify-between">
                        <div>
                          <CustomText className="text-xs text-gray-500 mb-1">
                            Min. investment
                          </CustomText>
                          <CustomText className="text-sm font-bold text-gray-900">
                            {/* {convertNumberIndian(20000)} */}
                            {scheme.minAmount ? convertNumberIndian(scheme.minAmount) : 0}
                          </CustomText>
                        </div>
                        <div className="text-right">
                          <CustomText className="text-xs text-gray-500 mb-1">
                            Risk Rating
                          </CustomText>
                          {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(scheme.riskRating)}`}> */}
                          <span className={`px-2 py-1 badge text-xs rounded-full font-medium  ${RISK_COLOR(scheme?.SchemeMaster?.riskLevel)}`}>
                            {scheme?.SchemeMaster?.riskLevel}
                          </span>
                        </div>

                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div
                          data-tip="Transact"
                          tabIndex={0}
                          role="button"
                          className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                          onClick={() => {
                            setSelectedScheme(scheme?.SchemeMaster);
                            onSchemeClick(scheme?.SchemeMaster)
                          }}

                        >
                          <GrTransaction
                            size={14}
                            className="text-primary"
                          />
                          <span>Transact</span>
                        </div>
                        <div
                          data-tip="Add to Cart"
                          className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                          onClick={(event: any) => {
                            addToCart(scheme?.SchemeMaster?.id);
                          }}
                        >
                          <IoCartOutline size={16} className="text-white" />
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                ))) : (
                <div className="col-span-5">
                  <CustomText className="text-center text-gray-500">
                    No Data Found
                  </CustomText>
                </div>
              )}
            </div>
            {/* </div> */}
            {/* {loaded && instanceRef.current && (
            <>
              <div className="flex gap-5 absolute right-1 -top-13">
                <div className={`bg-accent rounded-full p-2 ${currentSlide === 0 ? `arrow--disabled` : ``}`}>

                  <FaAngleLeft onClick={(e: any) => {
                    e.stopPropagation();
                    if (currentSlide === 0) return;
                    instanceRef.current?.prev();
                  }} size={20} className={`${currentSlide === 0 ? `arrow--disabled` : ``}`} />
                </div>

                <div className={`bg-accent rounded-full p-2 ${currentSlide ===
                  instanceRef.current.track.details.slides.length - 1 ? `arrow--disabled` : ``}`}>

                  <FaAngleRight size={20} onClick={(e: any) => {
                    e.stopPropagation();
                    if (!instanceRef.current ||
                      currentSlide === instanceRef.current.track.details.slides.length - 1) return;
                    instanceRef.current?.next();
                  }}
                    className={`${currentSlide ===
                      instanceRef.current.track.details.slides.length - 1 ? `arrow--disabled` : ``}`}
                  />
                </div>
              </div>
            </>
          )} */}
          </div>
        </div>
      </div>

      <PurchaseDetailPopup
        modalId="purchaseDetailModal"
        showTriggerButton={false}
        schemeData={selectedScheme}
      />

      {
        showSipPopup && (
          <SipPopup
            schemeData={selectedScheme}
            open={showSipPopup}
            onClose={() => setShowSipPopup(false)}
          />
        )
      }


    </>
  );
};

export default TopPerformingSchemes;
