import api from "@/utils/api";
export const fetchDecentroByMobile = async (mobile: any) => {
    const result: any = await api.post(
        `/decentro/log-mobile-to-account`, { mobile_number: mobile.trim(), }
    );
    return result;

};
export const fetchHolderDetails = async (investor_id: number) => {
    try {
        const response = await api.post("/kyc/get-holder-details", {
            investor_id
        });

        return response?.data;   // always return data only
    } catch (error: any) {
        console.error("fetchHolderDetails Error:", error);
        throw error;
    }
};



