"use client";

import {
  FLAT_MENU,
  MENU_PREFIX
} from "@/utils/constants";
import {
  getLS,
  handleServerError
} from "@/utils/helpers";
import { matchSorter } from "match-sorter";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as BsIcons from "react-icons/bs";
import * as FaIcons from "react-icons/fa";
import * as FiIcons from "react-icons/fi";
import * as GiIcons from "react-icons/gi";
import * as GoIcons from "react-icons/go";
import * as HiIcons from "react-icons/hi";
import { HiOutlineBars3CenterLeft } from "react-icons/hi2";
import * as Io5Icons from "react-icons/io5";
import * as LiaIcons from "react-icons/lia";
import * as MdIcons from "react-icons/md";

export default function Sidebar({
  toggleSidebar,
  collapsed,
}: {
  toggleSidebar: () => void;
  collapsed: boolean;
}) {

  const router = useRouter();

  const [menuList, setMenuList] = useState([]);
  const [isMobileView, setIsMobileView] = useState<any>(false);
  const [openMenu, setOpenMenu] = useState<any>(false);

  const [searchMenu, setSearchMenu] = useState<any>();
  const [mainMenuList, setMainMenuList] = useState<any>(menuList);

  const pathname = usePathname();
  // console.log(collapsed, "collapsedcollapsed");

  useEffect(() => {

    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // or 640
    };

    handleResize(); // set on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getMenuList();
  }, []);

  const getMenuList = () => {
    try {
      let menu = getLS(MENU_PREFIX);
      setMenuList(menu);
    } catch (error) {
      handleServerError(error);
    }
  };


  useEffect(() => {
    setMainMenuList(menuList);
  }, [menuList]);



  const getIconComponent = (iconName: any) => {
    // Check both libraries for the icon
    return (
      GiIcons[iconName as keyof typeof GiIcons] ||
      MdIcons[iconName as keyof typeof MdIcons] ||
      HiIcons[iconName as keyof typeof HiIcons] ||
      FaIcons[iconName as keyof typeof FaIcons] ||
      Io5Icons[iconName as keyof typeof Io5Icons] ||
      FiIcons[iconName as keyof typeof FiIcons] ||
      BsIcons[iconName as keyof typeof BsIcons] ||
      BiIcons[iconName as keyof typeof BiIcons] ||
      GoIcons[iconName as keyof typeof GoIcons] ||
      AiIcons[iconName as keyof typeof AiIcons] ||
      LiaIcons[iconName as keyof typeof LiaIcons] ||
      null
    );
  };

  const DynamicIcon = ({ iconName }: any) => {
    const IconComponent = getIconComponent(iconName);

    if (!IconComponent) {
      return null; // Return null if the icon is not found
    }

    return (
      <IconComponent className="w-5 h-5" aria-hidden="true" color="white" />
    );
  };


  return (
    <>
      <>
        {!openMenu && (
          <div
            className={`flex ${collapsed ? "w-16 py-0 px-0" : "w-[288px] p-0 justify-start overflow-y-auto"
              } transition-all flex-col sticky top-0 z-10  h-screen`}
          >
            <div className="text-left sticky top-0 z-10 bg-secondary" onClick={toggleSidebar}>
              <HiOutlineBars3CenterLeft
                color="white"
                className="cursor-pointer p-3 w-12 h-12"
              />
            </div>

            <div
              onMouseEnter={() => collapsed ? setOpenMenu(true) : undefined}   // hover in -> expand
              onMouseLeave={() => collapsed ? setOpenMenu(false) : undefined}    // hover out -> collapse
            >
              <ul className="menu mt-3 w-full flex flex-col gap-1 text-base text-white">
                {mainMenuList.length > 0 &&
                  mainMenuList.map((item: any, index: number) => (
                    <Fragment key={`item-${index}`}>
                      <li className="group">
                        {item.children && item.children.length > 0 ? (
                          <details>
                            <summary className={`cursor-pointer py-3 ${collapsed ? "after:absolute after:right-1" : ""}`}>
                              <div className="flex gap-4 items-center">
                                <DynamicIcon iconName={item.icon} />
                                {!collapsed ? (
                                  <span className="text-sm font-normal text-nowrap">
                                    {item.title}
                                  </span>
                                ) : (
                                  <span className="invisible group-hover:visible absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10">
                                    {item.title}
                                  </span>
                                )}
                              </div>
                            </summary>
                            <ul className={`${collapsed ? "ms-0 ps-0" : ""}`}>
                              {item.children.map(
                                (subItem: any, subIndex: number) => (
                                  <li key={`subItem-${subIndex}`}>
                                    <Link
                                      href={subItem.link || "/"}
                                      className={`${pathname === subItem.link
                                        ? `activePage py-3 block`
                                        : `py-3 block`
                                        }`}
                                    >
                                      <div className={`flex gap-4 ${collapsed ? "justify-center" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                                        <DynamicIcon iconName={subItem.icon} />
                                        {!collapsed ? (
                                          <span className="text-sm font-normal">
                                            {subItem.title}
                                          </span>
                                        ) : (
                                          <span className="invisible group-hover:visible absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10">
                                            {subItem.title}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          </details>
                        ) : (
                          <Link
                            href={item.link || "/"}
                            className={`${pathname === item.link ? `activePage py-3 block` : `py-3 block`
                              }`}
                          >
                            <div className={`flex gap-4 items-center ${collapsed ? "justify-center" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                              <DynamicIcon iconName={item.icon} />
                              {!collapsed ? (
                                <span className="text-sm font-normal">
                                  {item.title}
                                </span>
                              ) : (
                                <span className="invisible group-hover:visible absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10">
                                  {item.title}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                      </li>
                      <div className="my-0 h-[1px] w-full bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
                    </Fragment>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* <div className="p-5 pt-12 absolute top-0 left-16 z-50 overflow-y-auto h-screen">
          <ul className="menu mt-3 w-full flex flex-col gap-1 text-base text-white">
            {mainMenuList.length > 0 &&
              mainMenuList.map((item: any, index: number) => (
                <Fragment key={`item-${index}`}>
                  <li className="group">
                    {item.children && item.children.length > 0 ? (
                      <>
                        {hoverIndex === index ? (<>
                          <summary className={`cursor-pointer py-3 ${collapsed ? "after:absolute after:right-1" : ""} ${hoverIndex === index ? "opacity-100 bg-secondary" : "opacity-0"}`}>
                            <div className="flex gap-4 items-center">
                              <DynamicIcon iconName={item.icon} />
                              <span className="text-sm font-normal text-nowrap">
                                {item.title}
                              </span>
                            </div>
                          </summary>
                          <ul className={`${collapsed ? "ms-0 ps-0" : ""} ${hoverIndex === index ? "opacity-100 bg-secondary" : "opacity-0"}`}>
                            {item.children.map(
                              (subItem: any, subIndex: number) => (
                                <li key={`subItem-${subIndex}`}>
                                  <Link
                                    href={subItem.link || "/"}
                                    className={`${pathname === subItem.link
                                      ? `activePage py-3 block`
                                      : `py-3 block`
                                      }`}
                                  >
                                    <div className={`flex gap-4 ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                                      <DynamicIcon iconName={subItem.icon} />
                                      <span className="text-sm font-normal">
                                        {subItem.title}
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              )
                            )}
                          </ul>
                        </>) : (
                          <details>
                            <summary className={`cursor-pointer py-3 ${collapsed ? "after:absolute after:right-1" : ""} ${hoverIndex === index ? "opacity-100" : "opacity-0"}`}>
                              <div className="flex gap-4 items-center">
                                <DynamicIcon iconName={item.icon} />
                                <span className="text-sm font-normal text-nowrap">
                                  {item.title}
                                </span>
                              </div>
                            </summary>
                            <ul className={`${collapsed ? "ms-0 ps-0" : ""} ${hoverIndex === index ? "opacity-100" : "opacity-0"}`}>
                              {item.children.map(
                                (subItem: any, subIndex: number) => (
                                  <li key={`subItem-${subIndex}`}>
                                    <Link
                                      href={subItem.link || "/"}
                                      className={`${pathname === subItem.link
                                        ? `activePage py-3 block`
                                        : `py-3 block`
                                        }`}
                                    >
                                      <div className={`flex gap-4 ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                                        <DynamicIcon iconName={subItem.icon} />
                                        <span className="text-sm font-normal">
                                          {subItem.title}
                                        </span>
                                      </div>
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          </details>
                        )}1
                      </>
                    ) : (
                      <Link
                        href={item.link || "/"}
                        className={`bg-secondary ${pathname === item.link ? `activePage py-3 block` : `py-3 block`
                          } ${hoverIndex === index ? "opacity-100" : "opacity-0"}`}
                      >
                        <div className={`flex gap-4 items-center ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                          <span className="text-sm font-normal">
                            {item.title}
                          </span>
                        </div>
                      </Link>
                    )}
                  </li>
                  <div className="my-0 h-[1px] w-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0"></div>
                </Fragment>
              ))}
          </ul>
        </div> */}

        {/* {collapsed && (
          <div className="p-5 bg-gray-800 w-56 absolute top-0 left-16 z-50 overflow-y-auto h-screen">
            <ul className="menu mt-3 w-full flex flex-col gap-1 text-base text-white">
              {hoveredItem &&
                <Fragment>
                  <li className="group">
                    {hoveredItem.children && hoveredItem.children.length > 0 ? (
                      <>
                        <summary className={`cursor-pointer py-3 ${collapsed ? "after:absolute after:right-1" : ""}`}>
                          <div className="flex gap-4 items-center">
                            <span className="text-sm font-normal text-nowrap">
                              {hoveredItem.title}
                            </span>
                          </div>
                        </summary>
                        <ul className={`${collapsed ? "ms-0 ps-0" : ""}`}>
                          {hoveredItem.children.map(
                            (subItem: any, subIndex: number) => (
                              <li key={`subItem-${subIndex}`}>
                                <Link
                                  href={subItem.link || "/"}
                                  className={`${pathname === subItem.link
                                    ? `activePage py-3 block`
                                    : `py-3 block`
                                    }`}
                                >
                                  <div className={`flex gap-4 ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                                    <span className="text-sm font-normal">
                                      {subItem.title}
                                    </span>
                                  </div>
                                </Link>
                              </li>
                            )
                          )}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={hoveredItem.link || "/"}
                        className={`${pathname === hoveredItem.link ? `activePage py-3 block` : `py-3 block`
                          }`}
                      >
                        <div className={`flex gap-4 items-center ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                          <span className="text-sm font-normal">
                            {hoveredItem.title}
                          </span>
                        </div>
                      </Link>
                    )}
                  </li>
                </Fragment>
              }
            </ul>
          </div>
        )} */}

        {openMenu && collapsed && (
          <div
            className="p-0 w-64 bg-secondary absolute top-0 left-0 z-50 overflow-y-auto h-screen rounded-tr-3xl rounded-br-3xl"
            onMouseEnter={() => setOpenMenu(true)}   // hover in -> expand
            onMouseLeave={() => setOpenMenu(false)}    // hover out -> collapse
          >
            <div className="text-left sticky top-0 z-10 bg-secondary">
              <HiOutlineBars3CenterLeft
                color="white"
                className="cursor-pointer p-3 w-12 h-12"
              />
            </div>
            <ul className="menu mt-3 w-full flex flex-col gap-1 text-base text-white">
              {mainMenuList.length > 0 &&
                mainMenuList.map((item: any, index: number) => (
                  <Fragment key={`item-${index}`}>
                    <li className="group">
                      {item.children && item.children.length > 0 ? (
                        <details>
                          <summary className={`cursor-pointer py-3 ${collapsed ? "after:absolute after:right-1" : ""}`}>
                            <div className="flex gap-4 items-center">
                              <DynamicIcon iconName={item.icon} />
                              <span className="text-sm font-normal text-nowrap">
                                {item.title}
                              </span>
                            </div>
                          </summary>
                          <ul className={`${collapsed ? "ms-0 ps-0" : ""}`}>
                            {item.children.map(
                              (subItem: any, subIndex: number) => (
                                <li key={`subItem-${subIndex}`}>
                                  <Link
                                    href={subItem.link || "/"}
                                    className={`${pathname === subItem.link
                                      ? `activePage py-3 block`
                                      : `py-3 block`
                                      }`}
                                  >
                                    <div className={`flex gap-4 ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                                      <DynamicIcon iconName={subItem.icon} />
                                      <span className="text-sm font-normal">
                                        {subItem.title}
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              )
                            )}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          href={item.link || "/"}
                          className={`${pathname === item.link ? `activePage py-3 block` : `py-3 block`
                            }`}
                        >
                          <div className={`flex gap-4 items-center ${collapsed ? "justify-start" : ""}`} onClick={isMobileView ? toggleSidebar : undefined}>
                            <DynamicIcon iconName={item.icon} />
                            <span className="text-sm font-normal">
                              {item.title}
                            </span>
                          </div>
                        </Link>
                      )}
                    </li>
                    <div className="my-0 h-[1px] w-full bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
                  </Fragment>
                ))}
            </ul>
          </div>
        )}
      </>
    </>
  );
}
