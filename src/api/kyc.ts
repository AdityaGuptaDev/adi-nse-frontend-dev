import api from "@/utils/api";
export const fetchDecentroByMobile = async (mobile: any) => {
    const result: any = await api.post(
        `/decentro/log-mobile-to-account`, { mobile_number: mobile.trim(), }
    );
    return result;

};
export const fetchHolderDetails = async (investor_id: number) => {
    // Bail early when the investor_id is missing — the backend would reject
    // with a generic 400/500 that surfaces as an empty error object and
    // pollutes the console on every onboarding mount for new users.
    if (!investor_id) {
        return { data: { data: { data: null } } } as any;
    }
    // Intentionally no console.error here: a 404/empty response is the
    // expected state for a fresh onboarding where the holder row does not
    // exist yet. Callers already handle the null/empty result.
    const response = await api.post("/kyc/get-holder-details", {
        investor_id,
    });
    return response?.data;
};



