import React from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiHome,
  FiCalendar,
  FiGift,
  FiPieChart,
  FiDollarSign,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";

const ProfessionalProfileScreen = () => {
  const reportLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Portfolio Summary", path: "/portfolio-summary" },
    { label: "Portfolio Valuation", path: "/portfolio-valuation" },
    { label: "Send Invitation", path: "/send-invitation" },
    { label: "Folios", path: "/folios" },
    { label: "Recent Transactions", path: "/recent-transactions" },
  ];

  const handleFeatureClick = (path:any) => {
    alert(`Navigate to ${path}`); // You can replace this with router navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 via-orange-50 to-pink-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <motion.div
            className="w-16 h-16 bg-white text-indigo-500 rounded-full flex items-center justify-center text-2xl font-bold"
            whileHover={{ scale: 1.1 }}
          >
            AJ
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold">AJAY KUMAR</h1>
            <p className="text-sm text-orange-100">Investor Profile Overview</p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <ProfileCard title="Contact Information">
          <ProfileItem icon={<FiMail />} text="displaykumar6774@gmail.com" />
          <ProfileItem icon={<FiPhone />} text="9334491333" />
        </ProfileCard>

        {/* Escalation Matrix */}
        <ProfileCard title="Escalation Matrix">
          <ProfileItem text="Broker - VEDANT ASSET" icon={"'"} />
          <ProfileItem icon={<FiMail />} text="support@vedantasset.com" />
          <ProfileItem icon={<FiPhone />} text="9304955505" />
        </ProfileCard>

        {/* Sub Broker */}
        <ProfileCard title="Sub Broker - SANJEEV RANJAN TIWARI">
          <ProfileItem icon={<FiMail />} text="TIWARLSRT@GMAIL.COM" />
          <ProfileItem icon={<FiPhone />} text="9386666640" />
        </ProfileCard>

        {/* PAN Details */}
        <ProfileCard title="PAN Details">
          <ProfileItem icon={<FiUser />} text="ANEPK9652P" />
          <ProfileItem icon={<FiPhone />} text="Not Available" />
          <ProfileItem
            icon={<FiHome />}
            text="S O RAM TAPASYA SINGH QR NO D T 1844 TAN NEAR PANCHWATI MAIDAN DHURWA DHURWA RANC 834004 Ranchi - 834004"
          />
          <ProfileItem icon={<FiCalendar />} text="14-01-1972" />
          <ProfileItem icon={<FiGift />} text="Not Available" />
        </ProfileCard>

        {/* Features (Clickable Quick Links) */}
        <ProfileCard title="Quick Features">
          <div className="grid grid-cols-1 gap-3">
            {reportLinks.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeatureClick(item.path)}
                className="flex justify-between items-center bg-gradient-to-r from-indigo-300 to-purple-300 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition"
              >
                <span>{item.label}</span>
                <FiChevronRight />
              </motion.button>
            ))}
          </div>
        </ProfileCard>

        {/* AUM */}
        <ProfileCard title="AUM">
          <ProfileItem icon={<FiPieChart />} text="88,235" />
          <ProfileItem icon={<FiClock />} text="Not Available" />
          <ProfileItem icon={<FiDollarSign />} text="10" />
          <ProfileItem icon={<FiCalendar />} text="19-10-2023" />
          <ProfileItem icon={<FiCalendar />} text="13-04-2022" />
        </ProfileCard>
      </div>
    </div>
  );
};

// Reusable Components
const ProfileCard = ({ title, children }:any) => (
  <motion.div
    className="bg-white bg-opacity-90 backdrop-blur-lg shadow-lg rounded-xl p-5 hover:shadow-2xl transition"
    whileHover={{ scale: 1.02 }}
  >
    {title && <h2 className="font-semibold text-gray-700 mb-4">{title}</h2>}
    <div className="space-y-2">{children}</div>
  </motion.div>
);

const ProfileItem = ({ icon, text }:any) => (
  <div className="flex items-start space-x-3 text-gray-600 text-sm">
    <span className="text-orange-300 mt-1">{icon}</span>
    <span>{text}</span>
  </div>
);

export default ProfessionalProfileScreen;
