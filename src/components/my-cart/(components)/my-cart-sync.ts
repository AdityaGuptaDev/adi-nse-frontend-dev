"use client";

import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useContext, useEffect, useMemo, useState } from "react";
import { ShoppingCart, Trash2, Loader2, AlertCircle } from 'lucide-react';

const MyCartSync = () => {
    const [loader, setLoader] = useState<boolean>(false);
    const [currentAmt, setCurrentAmt] = useState<any>();
    const [amount, setAmount] = useState<any>();
    const [cartTab, setCartTab] = useState<any>("Purchase");
    const [cartList, setCartList] = useState<any>([]);
    const [paymentOpen, setPaymentOpen] = useState<boolean>(false);


    const {
        AccountHolder,
        investorContextList,
        handleInvesterChange,
        setAccountHolder,
        setCartCounter,
        cartCounter,
        InvestorId,
        investorListFunc,
        setInvestorId,
        cartData,
        setCartData
    } = useContext<any>(AccountContext)


    // const getCartData = async () => {
    //     try {
    //         setLoader(true);

    //         const payload = {
    //             user_id: InvestorId
    //         }
    //         console.log(payload, 'payload')

    //         const getCart = await api.get(`/cart/getAllInvestorCartData?data=${payload}`);

    //         if (getCart?.data?.data) {
    //             setLoader(false);
    //             setCartList(getCart.data.data);
    //         }
    //     } catch (error) {
    //         setLoader(false);
    //         console.log(error, "error");
    //         handleServerError(error);
    //     }
    // };

    useEffect(() => {
        investorListFunc();
    }, []);


    useMemo(() => {
        if (InvestorId !== 0) {
            // getCartData();
        }
    }, [InvestorId, AccountHolder]);


    const handleDeleteCart = async (cartId: number) => {
        try {
            await api.delete(`/cart/deleteCartItem/${cartId}`);
            setLoader(true);
            const payload = {
                investor_id: "1"
            }

            //const getCart = await api.get(`/cart/getAllInvestorCartData?data=${payload}`);
            //const getCart = await api.post(`/investor/kyc-users`);

            const getCart = await api.post(`/cart/getInvestorCartData`, payload);

            console.log(getCart, 'getCart')


            if (getCart?.data?.data) {
                const updatedCart = getCart.data.data;
                console.log(getCart.data.data, 'getCart.data.data')
                setCartList(updatedCart);
                setCartData(updatedCart);
                setCartCounter(updatedCart.length); // updated count
            }
            // setCartCounter(cartCounter - 1)
            setLoader(false);
            toastAlert("success", "Cart Deleted")
        } catch (error: any) {
            setLoader(false);
            console.log(error, "error");
            handleServerError(error);
        }
    }

    console.log(cartCounter, "cartCountercartCounter")

    const handleMultipalDeleteCart = async (cartIds: any) => {
        try {
            await api.post(`/cart/deleteMultiCartItem`, { cartIds });
            setLoader(true);
            const payload = {
                InvestorId
            }

            const getCart = await api.get(`/cart/getAllInvestorCartData?data=${payload}`);

            // if (getCart?.data?.data) {
            //     setCartList(getCart.data.data);
            // }
            // setCartCounter(cartCounter - cartIds.length)
            setLoader(false);
            toastAlert("success", "Cart Deleted")
        } catch (error: any) {
            setLoader(false);
            console.log(error, "error");
            handleServerError(error);
        }
    }

    // Helper function to get cart summary (can be used in UI components)
    const getCartSummary = () => {
        const totalItems = cartData?.length || 0;
        const totalAmount = cartData?.reduce((sum: number, item: any) => 
            sum + Number(item.trans_amount || item.amount || 0), 0) || 0;
        
        return {
            totalItems,
            totalAmount,
            lumpsumItems: cartData?.filter((item: any) => item.trans_type === 1)?.length || 0,
            sipItems: cartData?.filter((item: any) => item.trans_type === 2)?.length || 0,
            stpItems: cartData?.filter((item: any) => item.trans_type === 3)?.length || 0,
        };
    };

    // Helper function to check if cart is empty
    const isCartEmpty = () => {
        return !cartData || cartData.length === 0;
    };

    // Helper function to get cart item count
    const getCartItemCount = () => {
        return cartData?.length || 0;
    };

    return {
        // State variables
        loader,
        setCurrentAmt,
        currentAmt,
        setAmount,
        amount,
        setCartTab,
        cartTab,
        cartList,
        paymentOpen,
        setPaymentOpen,
        setLoader,
        setCartList,
        
        // Cart data
        cartData,
        setCartData,
        
        // Account related
        AccountHolder,
        investorContextList,
        handleInvesterChange,
        setAccountHolder,
        setInvestorId,
        InvestorId,
        
        // Cart operations
        handleDeleteCart,
        handleMultipalDeleteCart,
        
        // Cart utilities
        getCartSummary,
        isCartEmpty,
        getCartItemCount,
        
        // Cart counter
        cartCounter,
        setCartCounter,
    };
};

export default MyCartSync;