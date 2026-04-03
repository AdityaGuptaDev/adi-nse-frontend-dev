"use client";

// import React, { useReducer } from "react";
import { useEffect, useState } from "react";
import AccountContext from "./Account.context";
import { boolean } from "yup";
import api from "@/utils/api";
type ListingItem = {
  id: number;
  code: string;
  status: string;
};
interface OnBoardingListings {
  gender: ListingItem[];
  marital_status: ListingItem[];
  mobile_relation: ListingItem[];
  relationship_primaryHolder: ListingItem[];
  relationship_proof: ListingItem[];
  tax_status: ListingItem[];
  Bank_proof: any[];
  relationship_types: any[];
  nominee_guardian_relationship_types: any[];
  identity_type_list: any[];
  bank_list: any[]
}
export const AccountProvider = ({ children }: any) => {
  const [mandateDetails, setMandateDetails] = useState<any>({});
  const [AccountHolder, setAccountHolder] = useState<any>(0);
  const [InvestorId, setInvestorId] = useState<any>(0);
  const [cartCounter, setCartCounter] = useState<any>(null);
  const [investorContextList, setInvestorList] = useState<any>([]);
  const [kyc_master, setKyc_master] = useState<any>({});
  const [kyc_details, setKycDetails] = useState<any>({
    id: 0,
    group_leader_id: "",
    name: "",
    fathers_name: "",
    dob: "",
    pan_no: "",
    pan_doc: "",
    gender: "",
    marital_status: "",
    mothers_name: "",
    occupation: "",
    address_type: "",
    annual_income: "",
    source_of_income: "",
    member_type: "",
    isKYCDone: "",
    risk_category_id: "",
  });
  const [stausCartData, setSatatusCartData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [listings, setListings] = useState<OnBoardingListings>({
    gender: [],
    marital_status: [],
    mobile_relation: [],
    relationship_primaryHolder: [],
    relationship_proof: [],
    tax_status: [],
    Bank_proof: [],
    relationship_types: [],
    nominee_guardian_relationship_types: [],
    identity_type_list: [],
    bank_list: []
  });
  const investorListFunc = async () => {
    let investor = await api.post(`/investor/cart`);

    console.log(investor, "investor")


    let cartData = investor?.data?.data

    if (cartData.length > 0) {
      setCartData(investor?.data?.data);
    }

  };



  const handleInvesterChange = (event: any) => {
    setInvestorId(event?.target?.value);
  };



  return (
    <AccountContext.Provider
      value={{
        cartCounter,
        AccountHolder,
        mandateDetails,
        setMandateDetails,
        setAccountHolder,
        InvestorId,
        setInvestorId,
        setCartCounter,
        investorContextList,
        handleInvesterChange,
        setKycDetails,
        kyc_details,
        kyc_master,
        investorListFunc,
        setSatatusCartData,
        stausCartData,
        cartData,
        setCartData,
        setListings,
        listings
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
