import { Sequelize } from "sequelize/types";


const menu = [
  { id: 1, link: "/", parentID: null, title: "Dashboard", icon: "FiGrid", isActive: true, sequenceNumber: 1 },
  { id: 2, link: "/user-management", parentID: null, title: "User Management", icon: "FaUsers", isActive: true, sequenceNumber: 2 },
  { id: 3, link: "/user-management/user", parentID: 2, title: "User", icon: "FaUser", isActive: true, sequenceNumber: 3 },
  { id: 4, link: "/user-management/permission", parentID: 2, title: "Permission", icon: "BsFillShieldLockFill", isActive: true, sequenceNumber: 4 },
  { id: 5, link: "/user-management/role", parentID: 2, title: "Roles", icon: "FaCaretRight", isActive: true, sequenceNumber: 5 },

  // ── NSE Invest Online Module ──
  { id: 100, link: "#", parentID: null, title: "Invest Online NSE", icon: "FiTrendingUp", isActive: true, sequenceNumber: 100 },
  { id: 101, link: "/nse-inv-list", parentID: 100, title: "Profile List", icon: "FiUsers", isActive: true, sequenceNumber: 101 },
  { id: 102, link: "/create-ucc", parentID: 100, title: "Create UCC", icon: "FiUserPlus", isActive: true, sequenceNumber: 102 },
  { id: 103, link: "/nse-mandate-list", parentID: 100, title: "Mandate List", icon: "FiFileText", isActive: true, sequenceNumber: 103 },
  { id: 104, link: "/nse-new-investment", parentID: 100, title: "New Investment", icon: "FiPlusCircle", isActive: true, sequenceNumber: 104 },
  { id: 105, link: "/nse-my-orders", parentID: 100, title: "My Orders", icon: "FiPackage", isActive: true, sequenceNumber: 105 },
  { id: 106, link: "/nse-cart", parentID: 100, title: "Cart", icon: "FiShoppingCart", isActive: true, sequenceNumber: 106 },
  { id: 107, link: "/nse-systematic-orders", parentID: 100, title: "Systematic Orders", icon: "FiRepeat", isActive: true, sequenceNumber: 107 },
  { id: 108, link: "/nse-kyc-status", parentID: 100, title: "KYC Status Report", icon: "FiCheckCircle", isActive: true, sequenceNumber: 108 },
  { id: 109, link: "/nse-client-auth", parentID: 100, title: "Client Auth Report", icon: "FiShield", isActive: true, sequenceNumber: 109 },
  { id: 110, link: "/nse-transaction-report", parentID: 100, title: "Transaction Report", icon: "FiFileText", isActive: true, sequenceNumber: 110 },

  // Activity Log
  // {id: 10, link: "/activity-logger/list", parentID: null, title: "Activity Log", icon: "fa-solid fa-tag"  , isActive:true, sequenceNumber: 10},

];

export const seedMenu = async (sequelize: Sequelize) => { 
  return sequelize.getQueryInterface().bulkInsert("Menu", menu);
};