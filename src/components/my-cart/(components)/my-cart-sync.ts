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


    const getCartData = async () => {
        try {
            setLoader(true);

            // The backend reads `req.query.data` and JSON.parses it, so the
            // value has to be the JSON string of the payload, URL-encoded.
            // Templating an object directly produced "[object Object]" which
            // crashed the JSON.parse and returned 500.
            const payload = { InvestorId };
            const qs = encodeURIComponent(JSON.stringify(payload));

            const getCart = await api.get(`/cart/getAllInvestorCartData?data=${qs}`);

            if (getCart?.data?.data) {
                setLoader(false);
                setCartList(getCart.data.data);
                setCartData(getCart.data.data);
                setCartCounter(getCart.data.data.length);
            }
        } catch (error) {
            setLoader(false);
            console.log(error, "error");
            handleServerError(error);
        }
    };

    useEffect(() => {
        investorListFunc();
    }, []);


    useMemo(() => {
        if (InvestorId !== 0) {
            getCartData();
        }
    }, [InvestorId, AccountHolder]);


    const handleDeleteCart = async (cartId: number) => {
        try {
            setLoader(true);
            await api.delete(`/cart/deleteCartItem/${cartId}`);
            toastAlert("success", "Cart Deleted");
            // Hard-refresh so the cart list, header counter, and any other
            // cart-derived UI all rehydrate from a clean fetch — avoids
            // partial/stale state when re-rendering inline.
            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch (error: any) {
            setLoader(false);
            console.log(error, "error");
            handleServerError(error);
        }
    }

    console.log(cartCounter, "cartCountercartCounter")

    const handleMultipalDeleteCart = async (cartIds: any) => {
        try {
            setLoader(true);
            await api.post(`/cart/deleteMultiCartItem`, { cartIds });
            toastAlert("success", "Cart Deleted");
            if (typeof window !== "undefined") {
                window.location.reload();
            }
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