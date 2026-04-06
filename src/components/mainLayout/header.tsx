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

  let userType;

if (prodUserData?.partner?.userType_id) {
  userType = prodUserData.partner.userType_id;
} else {
  userType = prodUserData?.userTypeId ?? 0;
}

console.log("partner----",userType)
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

  if ( userType===2 ) {
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
      <div className="navbar p-0 md:px-5 sticky top-0 z-20 bg-[#F4F6F8] flex justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            onClick={toggleSidebar}
            className="lg:hidden cursor-pointer w-12 h-12 flex justify-center items-center"
          >
            <HiOutlineBars3CenterLeft className="cursor-pointer w-8 h-8" />
          </div>
          <div className="hidden lg:block">
            <Link href="/">
              <Logo link={`${publicPathName}/logo_light.png`} />
            </Link>
          </div>
          <div className="hidden lg:block w-12 h-px bg-base-content mx-1 mt-1"></div>
          <HeaderArea title={title} />
        </div>
        <div className="flex items-center gap-1 lg:gap-3">
          <div
            data-tip="Notification"
            className="tooltip tooltip-bottom relative cursor-pointer p-2 rounded-lg border border-secondary/10 shadow-[3px_3px_5px_rgba(0,0,0,0.1),-3px_-3px_5px_rgba(255,255,255,0.7)]"
          >
            <div className="absolute right-2 top-1 inline-grid *:[grid-area:1/1]">
              <div className="status status-error animate-ping"></div>
              <div className="status status-error"></div>
            </div>
            <GoBell className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div
            data-tip="Cart"
            className="tooltip tooltip-bottom relative cursor-pointer p-2 rounded-lg border border-secondary/10 shadow-[3px_3px_5px_rgba(0,0,0,0.1),-3px_-3px_5px_rgba(255,255,255,0.7)]"
            onClick={() => router.push("/my-cart")}
          >
            <div className="absolute right-[-5px] top-[-5px] sm:right-0 sm:top-0 inline-grid *:[grid-area:1/1]">
              <div className="badge badge-xs badge-primary">
                {cartCounter ? cartCounter : 0}
              </div>
              <div className="badge badge-xs badge-primary scale-70 animate-ping">
                {cartCounter ? cartCounter : 0}
              </div>
            </div>
            <IoCartOutline className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <div
              role="button"
              onClick={() => setOpen((prev) => !prev)}
              className="btn h-[34px] sm:h-auto cursor-pointer p-2 rounded-lg border border-secondary/10 shadow-[3px_3px_5px_rgba(0,0,0,0.1),-3px_-3px_5px_rgba(255,255,255,0.7)]"
            >
              <FaRegUser className="w-4 h-4 md:w-6 md:h-6" />
            </div>

            {open && (
              <div className="dropdown-content absolute top-full right-0 z-[100] mt-2 w-60 bg-white shadow-lg rounded-md overflow-hidden border border-gray-200">
                {/* User Name Section with better styling */}
                {userName && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href={targetLink}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm font-medium">Profile</span>
                    <ImProfile className="w-4 h-4 text-gray-500" />
                  </Link>
                  
                  <Link
                    href="/change-password"
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm font-medium">Change Password</span>
                    <FaUnlockAlt className="w-4 h-4 text-gray-500" />
                  </Link>
                  
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <span className="text-sm font-medium">Logout</span>
                    <FaPowerOff className="w-4 h-4" />
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