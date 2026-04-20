"use client";

import React, { useContext, useEffect, useRef, useState } from "react";

import { FaPowerOff, FaRegUser, FaUnlockAlt, FaUser } from "react-icons/fa";
import HeaderArea from "../moduleUi/headerArea";
import { GoBell } from "react-icons/go";
import Link from "next/link";
import {
  ADMIN_INVESTER_DATA,
  FLAT_MENU,
  MENU_PREFIX,
  PROD_DATA,
  TOKEN_PREFIX,
  USER_DATA,
  publicPathName,
} from "@/utils/constants";
import Logo from "./Logo";
import { IoCartOutline } from "react-icons/io5";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import {
  getLS,
  handleServerError,
  removeLS,
  remove_All_LS,
} from "@/utils/helpers";
import { cookieStorageKeys, removeCookieData, removeCookieToken } from "@/services/cookieStorageService";
import { useRouter } from "next/navigation";
import { HiOutlineBars3CenterLeft } from "react-icons/hi2";
import { ImProfile } from "react-icons/im";

const Header = ({
  toggleSidebar,
  title,
  collapsed,
  userData,
}: {
  toggleSidebar: () => void;
  title: any;
  collapsed: any;
  userData: any;
}) => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bcCreatedStatus, setBcCreatedStatus] = useState<Array<{ user_created: number }>>([]);

  const prodUserData = getLS(USER_DATA);
  const userTypeId = prodUserData?.partner?.userType_id ?? 0;
  //const userType = prodUserData?.userTypeId ?? 0;
  const partnerMobile = prodUserData?.mobile ?? 0;
  const userCreated = prodUserData?.partner?.userCreated ?? 0;
  //const userType1=prodUserData?.partner?.userType_id ?? 0;

  // Resolve userType by priority: investor mapping wins over partner/BC so that
  // a Users record with legacy/stale partner fields can't misroute an investor
  // into the partner onboarding flow.
  let userType;
  if (prodUserData?.InvestorRegistration?.userType_id) {
    userType = prodUserData.InvestorRegistration.userType_id;
  } else if (prodUserData?.partner?.userType_id) {
    userType = prodUserData.partner.userType_id;
  } else if (prodUserData?.BC?.userType_id) {
    userType = prodUserData.BC.userType_id;
  } else {
    userType = prodUserData?.userTypeId ?? 0;
  }

  let targetLink = "/my-profile";
  if (userType === 4) {
    targetLink =
      userCreated === 1
        ? "/my-profile"
        : `/partnerOnboarding?mobile=${partnerMobile}`;
  }

  if (userType === 6) {
    const isBcCreated = bcCreatedStatus?.[0]?.user_created ?? 0;
    targetLink =
      isBcCreated === 1
        ? "/my-profile"
        : `/bcOnboarding?mobile=${partnerMobile}`;
  }

  if (userType === 2) {
    targetLink = "/my-profile";
  }

  useEffect(() => {
    async function fetchBcStatus() {
      try {
        const response = await api.get(`/partner/getBcCreatedStatus/${partnerMobile}`);
        setBcCreatedStatus(response.data.data.results || []);
      } catch (error) {
        console.error("Error fetching BC status:", error);
      }
    }

    if (partnerMobile) {
      fetchBcStatus();
    }
  }, [partnerMobile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (userData?.email) {
      setEmail(userData.email);
      getCartCount();
    }
    
    const name = userData?.name || 
                prodUserData?.name || 
                prodUserData?.partner?.name || 
                userData?.userName || 
                prodUserData?.userName || 
                '';
    
    setUserName(name);
  }, [userData]);

  const { cartCounter, setCartCounter } = useContext<any>(AccountContext);

  const getCartCount = async () => {
    try {
      const getCart = await api.get(`/cart/findCartDataCount`);
      setCartCounter(getCart?.data?.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const callCartCount = async () => {
    try {
      if (cartCounter == null) {
        const getCart = await api.get(
          `/cart/getAllInvestorCartData?data=${null}`
        );
        let countCart = getCart?.data?.data?.length || 0;
        setCartCounter(countCart);
      }
    } catch (error) {
      console.log(error, "errorerror");
      handleServerError(error);
    }
  };

  const handleLogout = async () => {
    if (!sessionStorage.getItem(USER_DATA)) {
      removeCookieToken();
      removeCookieData(cookieStorageKeys.INIT_PATH);
    }

    removeLS(PROD_DATA);
    removeLS(TOKEN_PREFIX);
    removeLS(MENU_PREFIX);
    removeLS(FLAT_MENU);
    removeLS(USER_DATA);
    removeLS(ADMIN_INVESTER_DATA)
    localStorage.clear()

    router.push("/login");
  };

  return (
    <>
      <div className="navbar p-0 md:px-5 sticky top-0 z-20 bg-[#111111] border-b border-[#2A2A2A] flex justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div
            onClick={toggleSidebar}
            className="lg:hidden cursor-pointer w-12 h-12 flex justify-center items-center hover:bg-[#1F1A1A] transition-colors rounded-lg"
          >
            <HiOutlineBars3CenterLeft className="cursor-pointer w-6 h-6 text-[#F9FAFB]" />
          </div>
          <div className="hidden lg:block">
            <Link href="/">
              <Logo link={`${publicPathName}/logo_light.png`} />
            </Link>
          </div>
          <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-[#F59E0B] to-transparent mx-1 mt-1"></div>
          <div className="text-white">
            <HeaderArea title={title} />
          </div>
        </div>
        <div className="flex items-center gap-1 lg:gap-3">
          <div
            data-tip="Notification"
            className="tooltip tooltip-bottom relative cursor-pointer p-2 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B]/50 transition-all duration-200"
          >
            <div className="absolute right-1 top-0 inline-grid *:[grid-area:1/1]">
              <div className="status status-error animate-ping w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="status status-error w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <GoBell className="w-4 h-4 md:w-5 md:h-5 text-[#F9FAFB]" />
          </div>
          <div
            data-tip="Cart"
            className="tooltip tooltip-bottom relative cursor-pointer p-2 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B]/50 transition-all duration-200"
            onClick={() => router.push("/my-cart")}
          >
            <div className="absolute right-[-5px] top-[-5px] sm:right-0 sm:top-0 inline-grid *:[grid-area:1/1]">
              <div className="badge badge-xs bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white border-none px-1.5 py-0.5 rounded-full text-xs font-bold">
                {cartCounter ? cartCounter : 0}
              </div>
              <div className="badge badge-xs bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white scale-70 animate-ping px-1.5 py-0.5 rounded-full text-xs font-bold opacity-50">
                {cartCounter ? cartCounter : 0}
              </div>
            </div>
            <IoCartOutline className="w-4 h-4 md:w-5 md:h-5 text-[#F9FAFB]" />
          </div>

          <div className="relative" ref={dropdownRef}>
            <div
              role="button"
              onClick={() => setOpen((prev) => !prev)}
              className="btn h-[34px] sm:h-auto cursor-pointer p-2 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B]/50 transition-all duration-200"
            >
              <FaRegUser className="w-4 h-4 md:w-5 md:h-5 text-[#F9FAFB]" />
            </div>

            {open && (
              <div className="dropdown-content absolute top-full right-0 z-[100] mt-2 w-64 bg-[#111111] shadow-2xl rounded-xl overflow-hidden border border-[#2A2A2A]">
                {/* User Name Section */}
                {userName && (
                  <div className="px-4 py-3 bg-gradient-to-r from-[#F59E0B]/10 to-[#B45309]/10 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F9FAFB]">{userName}</p>
                        {email && (
                          <p className="text-xs text-[#9CA3AF] mt-0.5 truncate max-w-[160px]">{email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href={targetLink}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#1F1A1A] text-[#F9FAFB] hover:text-[#F59E0B] transition-colors group"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm font-medium">Profile</span>
                    <ImProfile className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" />
                  </Link>

                  <Link
                    href="/change-password"
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#1F1A1A] text-[#F9FAFB] hover:text-[#F59E0B] transition-colors group"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm font-medium">Change Password</span>
                    <FaUnlockAlt className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" />
                  </Link>

                  <div className="h-px bg-[#2A2A2A] my-1"></div>

                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#1F1A1A] text-red-400 hover:text-red-300 transition-colors group"
                  >
                    <span className="text-sm font-medium">Logout</span>
                    <FaPowerOff className="w-4 h-4 group-hover:scale-105 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;