"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LangCode = "en" | "hi" | "mr" | "gu" | "ta" | "te" | "bn" | "kn";

export const LANG_OPTIONS: { code: LangCode; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "bn", label: "Bengali", native: "বাংলা" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

const STORAGE_KEY = "va_lang";

// Translation dictionary. English is the canonical/source set; every other
// language falls back to English when a key is missing, so partial coverage
// degrades gracefully.
const TRANSLATIONS: Record<LangCode, Record<string, string>> = {
    en: {
        // Landing nav
        "nav.home": "Home",
        "nav.features": "Features",
        "nav.calculator": "Calculator",
        "nav.app": "Mobile App",
        "nav.about": "About",
        "nav.signIn": "Sign In",
        "nav.register": "Register",
        // Dashboard nav (post-login)
        "dnav.accountHolding": "Account Holding",
        "dnav.fundExplore": "Fund Explore",
        "dnav.calculator": "Calculator",
        "dnav.riskProfile": "Risk Profile",
        "dnav.reports": "Reports",
        "dnav.article": "Articles",
        "dnav.videos": "Investment Videos",
        // Login
        "login.welcome": "Welcome",
        "login.tabPassword": "Password",
        "login.tabOtp": "OTP",
        "login.emailOrMobile": "Email / Mobile No.",
        "login.emailOrMobilePlaceholder": "Enter Email or Mobile Number",
        "login.password": "Password",
        "login.passwordPlaceholder": "Enter Password",
        "login.forgotPassword": "Forgot Password?",
        "login.button": "Login",
        "login.loggingIn": "Logging in...",
        "login.mobileNumber": "Mobile Number",
        "login.mobilePlaceholder": "Enter 10-digit mobile number",
        "login.sendOtp": "Send OTP",
        "login.sendingOtp": "Sending OTP...",
        "login.otpSent": "OTP Sent Successfully",
        "login.otpSentTo": "OTP sent to",
        "login.selectUserType": "Select User Type",
        "login.selectUserTypeDesc": "Multiple user types found for this account. Please select how you want to login:",
        "login.cancel": "Cancel",
        // Register
        "register.title": "Create Account",
        "register.registerAs": "Register as",
        "register.mobileNumber": "Mobile Number",
        "register.mobilePlaceholder": "Enter 10-digit mobile number",
        "register.mobileHint": "Must be a 10-digit Indian mobile number starting with 6-9",
        "register.validMobile": "Valid mobile number",
        "register.button": "Register Now",
        "register.processing": "Processing...",
        "register.secureNote": "Your information is secure and encrypted",
        "register.terms": "By registering, you agree to our Terms & Conditions",
        // OTP
        "otp.heading": "OTP Verification",
        "otp.subtitle": "We have sent the verification code to your mobile number",
        "otp.timeRemaining": "Time Remaining:",
        "otp.resend": "Resend OTP",
        "otp.submit": "Submit",
        "otp.processing": "Processing...",
        "otp.cancel": "Cancel",
        // Dashboard greeting
        "dash.namasteWith": "Namaste,",
        "dash.namasteAlone": "Namaste!",
        "dash.honorific": "Ji",
        "dash.pan": "PAN:",
        "dash.kyc": "KYC:",
        "dash.verified": "Verified",
        "dash.investorDashboard": "Investor Dashboard",
        "dash.quickActions": "Quick Actions",
        "dash.invest": "Invest",
        "dash.goals": "Goals",
        "dash.portfolio": "Portfolio",
        "dash.mySips": "My SIPs",
        "dash.portfolioSummary": "Portfolio Summary",
        "dash.portfolioSummarySub": "Real-time portfolio performance metrics",
        "dash.totalInvestment": "Total Investment",
        "dash.currentValue": "Current Value",
        "dash.oneDayReturn": "1D Return",
        "dash.xirr": "XIRR",
        "dash.profitLoss": "Profit & Loss",
        "dash.account": "Account",
        "dash.profile": "Profile",
        "dash.changePassword": "Change Password",
        "dash.online": "Online",
        "dash.assetAllocation": "Asset Allocation",
        "dash.assetAllocationSub": "Diversification across asset classes",
        "dash.portfolioDate": "Portfolio Date",
        "dash.noPortfolio": "No portfolio data available",
        // Register dropdown
        "register.investor": "Investor",
        "register.investorDesc": "Start your journey",
        "register.partner": "Partner",
        "register.partnerDesc": "Grow your business",
        // Hero
        "hero.badge": "SEBI Registered • Trusted by 50K+ Investors",
        "hero.title1": "Grow Your",
        "hero.title2": "Wealth Journey",
        "hero.subtitle":
            "Experience smart investing with AI-powered portfolio management, expert guidance, and market-beating returns. Start your journey today.",
        "hero.cta.register": "Register Now",
        "hero.cta.download": "Download App",
        "hero.stat.aum": "AUM Managed",
        "hero.stat.returns": "Avg. Returns",
        "hero.stat.investors": "Investors",
        "hero.appStoreRating": "App Store Rating",
        "hero.activeUsers": "Active Users",
        // Section eyebrows + titles
        "section.features.eyebrow": "WHY CHOOSE US",
        "section.features.titleA": "Invest with",
        "section.features.titleB": "Confidence",
        "section.calc.eyebrow": "CALCULATE RETURNS",
        "section.calc.titleA": "Plan Your",
        "section.calc.titleB": "Investment",
        "section.app.eyebrow": "MOBILE APP",
        "section.app.titleA": "Invest on the",
        "section.app.titleB": "Go",
        "section.app.subtitle":
            "Experience the power of smart investing right at your fingertips. Download our app and start your wealth journey today.",
        "section.steps.eyebrow": "GET STARTED",
        "section.steps.titleA": "Get Started in",
        "section.steps.titleB": "4 Simple Steps",
        // Calculator labels
        "calc.sip": "SIP",
        "calc.lumpsum": "Lumpsum",
        "calc.potentialAfter": "Potential Value After",
        "calc.years": "Years",
        "calc.monthlySip": "Monthly SIP Amount",
        "calc.lumpsumInvest": "Lumpsum Investment",
        "calc.investmentPeriod": "Investment Period",
        "calc.expectedReturn": "Expected Return Rate",
        "calc.annual": "Annual",
        "calc.wealthGrowth": "Wealth Growth Projection",
        "calc.investment": "Investment",
        "calc.returns": "Returns",
        "calc.invested": "Invested Amount",
        "calc.estReturns": "Estimated Returns",
        "calc.totalValue": "Total Value",
        "calc.quickPlan": "Quick Select Plan",
        "calc.note":
            "Note: Returns are calculated based on the selected investment plan. Actual returns may vary based on market conditions and fund performance.",
    },

    hi: {
        "nav.home": "होम",
        "nav.features": "विशेषताएँ",
        "nav.calculator": "कैलकुलेटर",
        "nav.app": "मोबाइल ऐप",
        "nav.about": "हमारे बारे में",
        "nav.signIn": "साइन इन",
        "nav.register": "पंजीकरण",
        "dnav.accountHolding": "खाता होल्डिंग",
        "dnav.fundExplore": "फ़ंड एक्सप्लोर",
        "dnav.calculator": "कैलकुलेटर",
        "dnav.riskProfile": "जोखिम प्रोफ़ाइल",
        "dnav.reports": "रिपोर्ट्स",
        "dnav.article": "लेख",
        "dnav.videos": "निवेश वीडियो",
        "login.welcome": "स्वागत है",
        "login.tabPassword": "पासवर्ड",
        "login.tabOtp": "ओटीपी",
        "login.emailOrMobile": "ईमेल / मोबाइल नंबर",
        "login.emailOrMobilePlaceholder": "ईमेल या मोबाइल नंबर दर्ज करें",
        "login.password": "पासवर्ड",
        "login.passwordPlaceholder": "पासवर्ड दर्ज करें",
        "login.forgotPassword": "पासवर्ड भूल गए?",
        "login.button": "लॉगिन",
        "login.loggingIn": "लॉगिन हो रहा है...",
        "login.mobileNumber": "मोबाइल नंबर",
        "login.mobilePlaceholder": "10 अंकों का मोबाइल नंबर दर्ज करें",
        "login.sendOtp": "ओटीपी भेजें",
        "login.sendingOtp": "ओटीपी भेजी जा रही है...",
        "login.otpSent": "ओटीपी सफलतापूर्वक भेज दी गई",
        "login.otpSentTo": "ओटीपी भेजी गई",
        "login.selectUserType": "उपयोगकर्ता प्रकार चुनें",
        "login.selectUserTypeDesc": "इस खाते के लिए कई उपयोगकर्ता प्रकार मिले हैं। कृपया चुनें कि आप कैसे लॉगिन करना चाहते हैं:",
        "login.cancel": "रद्द करें",
        "register.title": "खाता बनाएँ",
        "register.registerAs": "इस रूप में पंजीकरण करें",
        "register.mobileNumber": "मोबाइल नंबर",
        "register.mobilePlaceholder": "10 अंकों का मोबाइल नंबर दर्ज करें",
        "register.mobileHint": "6-9 से शुरू होने वाला 10 अंकों का भारतीय मोबाइल नंबर होना चाहिए",
        "register.validMobile": "मान्य मोबाइल नंबर",
        "register.button": "अभी पंजीकरण करें",
        "register.processing": "प्रसंस्करण हो रहा है...",
        "register.secureNote": "आपकी जानकारी सुरक्षित और एन्क्रिप्टेड है",
        "register.terms": "पंजीकरण करके, आप हमारी शर्तें और नियम स्वीकार करते हैं",
        "otp.heading": "ओटीपी सत्यापन",
        "otp.subtitle": "हमने सत्यापन कोड आपके मोबाइल नंबर पर भेज दिया है",
        "otp.timeRemaining": "शेष समय:",
        "otp.resend": "ओटीपी पुनः भेजें",
        "otp.submit": "जमा करें",
        "otp.processing": "प्रसंस्करण हो रहा है...",
        "otp.cancel": "रद्द करें",
        "dash.namasteWith": "नमस्ते,",
        "dash.namasteAlone": "नमस्ते!",
        "dash.honorific": "जी",
        "dash.pan": "पैन:",
        "dash.kyc": "केवाईसी:",
        "dash.verified": "सत्यापित",
        "dash.investorDashboard": "निवेशक डैशबोर्ड",
        "dash.quickActions": "त्वरित क्रियाएँ",
        "dash.invest": "निवेश करें",
        "dash.goals": "लक्ष्य",
        "dash.portfolio": "पोर्टफोलियो",
        "dash.mySips": "मेरी एसआईपी",
        "dash.portfolioSummary": "पोर्टफोलियो सारांश",
        "dash.portfolioSummarySub": "रीयल-टाइम पोर्टफोलियो प्रदर्शन मेट्रिक्स",
        "dash.totalInvestment": "कुल निवेश",
        "dash.currentValue": "वर्तमान मूल्य",
        "dash.oneDayReturn": "1दिन रिटर्न",
        "dash.xirr": "XIRR",
        "dash.profitLoss": "लाभ और हानि",
        "dash.account": "खाता",
        "dash.profile": "प्रोफ़ाइल",
        "dash.changePassword": "पासवर्ड बदलें",
        "dash.online": "ऑनलाइन",
        "dash.assetAllocation": "परिसंपत्ति आवंटन",
        "dash.assetAllocationSub": "विभिन्न परिसंपत्ति वर्गों में विविधीकरण",
        "dash.portfolioDate": "पोर्टफोलियो दिनांक",
        "dash.noPortfolio": "कोई पोर्टफोलियो डेटा उपलब्ध नहीं है",
        "register.investor": "निवेशक",
        "register.investorDesc": "अपनी यात्रा शुरू करें",
        "register.partner": "पार्टनर",
        "register.partnerDesc": "अपना व्यवसाय बढ़ाएँ",
        "hero.badge": "SEBI पंजीकृत • 50,000+ निवेशकों का भरोसा",
        "hero.title1": "बढ़ाएँ अपनी",
        "hero.title2": "धन यात्रा",
        "hero.subtitle":
            "AI-आधारित पोर्टफोलियो प्रबंधन, विशेषज्ञ मार्गदर्शन और बाज़ार से बेहतर रिटर्न के साथ स्मार्ट निवेश का अनुभव लें। आज ही अपनी यात्रा शुरू करें।",
        "hero.cta.register": "अभी पंजीकरण करें",
        "hero.cta.download": "ऐप डाउनलोड करें",
        "hero.stat.aum": "प्रबंधित AUM",
        "hero.stat.returns": "औसत रिटर्न",
        "hero.stat.investors": "निवेशक",
        "hero.appStoreRating": "ऐप स्टोर रेटिंग",
        "hero.activeUsers": "सक्रिय उपयोगकर्ता",
        "section.features.eyebrow": "हमें क्यों चुनें",
        "section.features.titleA": "निवेश करें",
        "section.features.titleB": "विश्वास के साथ",
        "section.calc.eyebrow": "रिटर्न की गणना करें",
        "section.calc.titleA": "योजना बनाएँ",
        "section.calc.titleB": "अपने निवेश की",
        "section.app.eyebrow": "मोबाइल ऐप",
        "section.app.titleA": "निवेश करें",
        "section.app.titleB": "चलते-फिरते",
        "section.app.subtitle":
            "स्मार्ट निवेश की शक्ति को अपनी उंगलियों पर अनुभव करें। हमारा ऐप डाउनलोड करें और आज ही अपनी धन यात्रा शुरू करें।",
        "section.steps.eyebrow": "शुरू करें",
        "section.steps.titleA": "शुरू करें केवल",
        "section.steps.titleB": "4 आसान चरणों में",
        "calc.sip": "एसआईपी",
        "calc.lumpsum": "एकमुश्त",
        "calc.potentialAfter": "अनुमानित मूल्य",
        "calc.years": "वर्ष",
        "calc.monthlySip": "मासिक एसआईपी राशि",
        "calc.lumpsumInvest": "एकमुश्त निवेश",
        "calc.investmentPeriod": "निवेश अवधि",
        "calc.expectedReturn": "अपेक्षित रिटर्न दर",
        "calc.annual": "वार्षिक",
        "calc.wealthGrowth": "धन वृद्धि अनुमान",
        "calc.investment": "निवेश",
        "calc.returns": "रिटर्न",
        "calc.invested": "निवेशित राशि",
        "calc.estReturns": "अनुमानित रिटर्न",
        "calc.totalValue": "कुल मूल्य",
        "calc.quickPlan": "त्वरित योजना चुनें",
        "calc.note":
            "नोट: रिटर्न चुनी गई निवेश योजना के आधार पर गणना किए गए हैं। वास्तविक रिटर्न बाज़ार की स्थितियों और फ़ंड प्रदर्शन के आधार पर भिन्न हो सकते हैं।",
    },

    mr: {
        "nav.home": "मुख्यपृष्ठ",
        "nav.features": "वैशिष्ट्ये",
        "nav.calculator": "कॅल्क्युलेटर",
        "nav.app": "मोबाइल अ‍ॅप",
        "nav.about": "आमच्याबद्दल",
        "nav.signIn": "साइन इन",
        "nav.register": "नोंदणी",
        "dnav.accountHolding": "खाते होल्डिंग",
        "dnav.fundExplore": "फंड एक्सप्लोर",
        "dnav.calculator": "कॅल्क्युलेटर",
        "dnav.riskProfile": "जोखीम प्रोफाइल",
        "dnav.reports": "अहवाल",
        "dnav.article": "लेख",
        "dnav.videos": "गुंतवणूक व्हिडिओ",
        "login.welcome": "स्वागत आहे",
        "login.button": "लॉगिन",
        "register.title": "खाते तयार करा",
        "register.button": "आता नोंदणी करा",
        "otp.heading": "ओटीपी पडताळणी",
        "otp.submit": "सबमिट",
        "otp.cancel": "रद्द करा",
        "dash.namasteWith": "नमस्ते,",
        "dash.namasteAlone": "नमस्ते!",
        "dash.honorific": "जी",
        "register.investor": "गुंतवणूकदार",
        "register.investorDesc": "तुमचा प्रवास सुरू करा",
        "register.partner": "भागीदार",
        "register.partnerDesc": "तुमचा व्यवसाय वाढवा",
        "hero.badge": "SEBI नोंदणीकृत • 50,000+ गुंतवणूकदारांचा विश्वास",
        "hero.title1": "वाढवा तुमचा",
        "hero.title2": "संपत्ती प्रवास",
        "hero.subtitle":
            "AI-आधारित पोर्टफोलिओ व्यवस्थापन, तज्ज्ञ मार्गदर्शन आणि बाजारापेक्षा अधिक परतावा यांचा अनुभव घ्या. आजच सुरुवात करा.",
        "hero.cta.register": "आता नोंदणी करा",
        "hero.cta.download": "अ‍ॅप डाउनलोड करा",
        "hero.stat.aum": "व्यवस्थापित AUM",
        "hero.stat.returns": "सरासरी परतावा",
        "hero.stat.investors": "गुंतवणूकदार",
        "section.features.eyebrow": "आम्हालाच का निवडावे",
        "section.features.titleA": "गुंतवणूक करा",
        "section.features.titleB": "आत्मविश्वासाने",
    },

    gu: {
        "nav.home": "હોમ",
        "nav.features": "વિશેષતાઓ",
        "nav.calculator": "કેલ્ક્યુલેટર",
        "nav.app": "મોબાઇલ એપ",
        "nav.about": "અમારા વિશે",
        "nav.signIn": "સાઇન ઇન",
        "nav.register": "નોંધણી",
        "dnav.accountHolding": "એકાઉન્ટ હોલ્ડિંગ",
        "dnav.fundExplore": "ફંડ એક્સપ્લોર",
        "dnav.calculator": "કેલ્ક્યુલેટર",
        "dnav.riskProfile": "જોખમ પ્રોફાઇલ",
        "dnav.reports": "રિપોર્ટ્સ",
        "dnav.article": "લેખ",
        "dnav.videos": "ઇન્વેસ્ટમેન્ટ વિડિઓઝ",
        "login.welcome": "સ્વાગત છે",
        "login.button": "લોગિન",
        "register.title": "એકાઉન્ટ બનાવો",
        "register.button": "હમણાં નોંધણી કરો",
        "otp.heading": "OTP ચકાસણી",
        "otp.submit": "સબમિટ",
        "otp.cancel": "રદ કરો",
        "dash.namasteAlone": "નમસ્તે!",
        "dash.honorific": "જી",
        "register.investor": "રોકાણકાર",
        "register.investorDesc": "તમારી યાત્રા શરૂ કરો",
        "register.partner": "પાર્ટનર",
        "register.partnerDesc": "તમારો વ્યવસાય વધારો",
        "hero.badge": "SEBI નોંધાયેલ • 50,000+ રોકાણકારો દ્વારા વિશ્વસનીય",
        "hero.title1": "વધારો તમારી",
        "hero.title2": "સંપત્તિ યાત્રા",
        "hero.cta.register": "હમણાં નોંધણી કરો",
        "hero.cta.download": "એપ ડાઉનલોડ કરો",
    },

    ta: {
        "nav.home": "முகப்பு",
        "nav.features": "அம்சங்கள்",
        "nav.calculator": "கால்குலேட்டர்",
        "nav.app": "மொபைல் ஆப்",
        "nav.about": "எங்களைப் பற்றி",
        "nav.signIn": "உள்நுழை",
        "nav.register": "பதிவு",
        "register.investor": "முதலீட்டாளர்",
        "register.investorDesc": "உங்கள் பயணத்தைத் தொடங்குங்கள்",
        "register.partner": "பங்குதாரர்",
        "register.partnerDesc": "உங்கள் வணிகத்தை வளர்த்துக்கொள்ளுங்கள்",
        "hero.badge": "SEBI பதிவு செய்யப்பட்டது • 50,000+ முதலீட்டாளர்களின் நம்பிக்கை",
        "hero.title1": "வளர்த்துக்கொள்ளுங்கள்",
        "hero.title2": "உங்கள் செல்வப் பயணத்தை",
        "hero.cta.register": "இப்போது பதிவு செய்க",
        "hero.cta.download": "ஆப்பை பதிவிறக்கவும்",
    },

    te: {
        "nav.home": "హోమ్",
        "nav.features": "ఫీచర్లు",
        "nav.calculator": "కాలిక్యులేటర్",
        "nav.app": "మొబైల్ యాప్",
        "nav.about": "మా గురించి",
        "nav.signIn": "సైన్ ఇన్",
        "nav.register": "నమోదు",
        "register.investor": "పెట్టుబడిదారు",
        "register.investorDesc": "మీ ప్రయాణాన్ని ప్రారంభించండి",
        "register.partner": "భాగస్వామి",
        "register.partnerDesc": "మీ వ్యాపారాన్ని పెంచుకోండి",
        "hero.badge": "SEBI నమోదు • 50,000+ పెట్టుబడిదారుల నమ్మకం",
        "hero.title1": "పెంచుకోండి మీ",
        "hero.title2": "సంపద ప్రయాణాన్ని",
        "hero.cta.register": "ఇప్పుడే నమోదు చేయండి",
        "hero.cta.download": "యాప్ డౌన్‌లోడ్ చేయండి",
    },

    bn: {
        "nav.home": "হোম",
        "nav.features": "বৈশিষ্ট্য",
        "nav.calculator": "ক্যালকুলেটর",
        "nav.app": "মোবাইল অ্যাপ",
        "nav.about": "আমাদের সম্পর্কে",
        "nav.signIn": "সাইন ইন",
        "nav.register": "নিবন্ধন",
        "register.investor": "বিনিয়োগকারী",
        "register.investorDesc": "আপনার যাত্রা শুরু করুন",
        "register.partner": "পার্টনার",
        "register.partnerDesc": "আপনার ব্যবসা বাড়ান",
        "hero.badge": "SEBI নিবন্ধিত • 50,000+ বিনিয়োগকারীর বিশ্বাস",
        "hero.title1": "বাড়িয়ে তুলুন",
        "hero.title2": "আপনার সম্পদ যাত্রা",
        "hero.cta.register": "এখনই নিবন্ধন করুন",
        "hero.cta.download": "অ্যাপ ডাউনলোড করুন",
    },

    kn: {
        "nav.home": "ಮುಖಪುಟ",
        "nav.features": "ವೈಶಿಷ್ಟ್ಯಗಳು",
        "nav.calculator": "ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        "nav.app": "ಮೊಬೈಲ್ ಆಪ್",
        "nav.about": "ನಮ್ಮ ಬಗ್ಗೆ",
        "nav.signIn": "ಸೈನ್ ಇನ್",
        "nav.register": "ನೋಂದಣಿ",
        "register.investor": "ಹೂಡಿಕೆದಾರ",
        "register.investorDesc": "ನಿಮ್ಮ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
        "register.partner": "ಪಾಲುದಾರ",
        "register.partnerDesc": "ನಿಮ್ಮ ವ್ಯವಹಾರ ಬೆಳೆಸಿ",
        "hero.badge": "SEBI ನೋಂದಾಯಿತ • 50,000+ ಹೂಡಿಕೆದಾರರ ನಂಬಿಕೆ",
        "hero.title1": "ಬೆಳೆಸಿ ನಿಮ್ಮ",
        "hero.title2": "ಸಂಪತ್ತಿನ ಪ್ರಯಾಣ",
        "hero.cta.register": "ಈಗಲೇ ನೋಂದಾಯಿಸಿ",
        "hero.cta.download": "ಆಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    },
};

interface LangContextValue {
    lang: LangCode;
    setLang: (l: LangCode) => void;
    t: (key: string) => string;
}

const LandingLanguageContext = createContext<LangContextValue | null>(null);

export function LandingLanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<LangCode>("en");

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
            if (stored && TRANSLATIONS[stored]) setLangState(stored);
        } catch {}
    }, []);

    const setLang = (l: LangCode) => {
        setLangState(l);
        try {
            window.localStorage.setItem(STORAGE_KEY, l);
        } catch {}
    };

    const value = useMemo<LangContextValue>(() => {
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
        const fallback = TRANSLATIONS.en;
        const t = (key: string) => dict[key] ?? fallback[key] ?? key;
        return { lang, setLang, t };
    }, [lang]);

    return (
        <LandingLanguageContext.Provider value={value}>
            {children}
        </LandingLanguageContext.Provider>
    );
}

export function useLandingLang(): LangContextValue {
    const ctx = useContext(LandingLanguageContext);
    if (!ctx) {
        // Safe fallback so components don't crash if rendered outside the provider.
        const fallback = TRANSLATIONS.en;
        return {
            lang: "en",
            setLang: () => {},
            t: (k: string) => fallback[k] ?? k,
        };
    }
    return ctx;
}
