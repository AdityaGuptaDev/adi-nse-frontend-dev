// ════════════════════════════════════════════════════════════════════════════
// Investor → Order Form routing helper
//
// Two execution lanes exist in this app:
//   • MFU / CAN → /mutual-fund/new-order   (Morningstar-backed, executeMfuTransaction)
//   • NSE / UCC → /nse-order-form          (NSE MF Desk, /nse/transaction)
//
// Every "Invest" / "Transact" click on the fund-browse pages has to pick the
// right one based on what registration the investor actually has. This helper
// centralizes that decision so the three entry points (mutual-fund/index,
// top-performing-scheme-list, fund-explore) behave identically.
//
// Decision:
//   1. Investor has a CAN (is_CAN_registered && InvestorAccountHolding[0].CAN_Id)
//        → MFU lane. Sets store.dataSource = "MFU" and navigates to
//          /mutual-fund/new-order (the existing store flow).
//   2. No CAN, but investor has a UCC (ucc_created / uccCreated / UCCRegistration
//      inline OR /nse/ucc/search-by-mobile/:mobile says uccCreated === 1)
//        → NSE lane. Sets store.dataSource = "NSE" and navigates to
//          /nse-order-form with the scheme identifiers. The order form's
//          built-in ISIN guard will resolve schemeISIN → canonical NSE
//          scheme_code via /nse/scheme/resolve-by-isin on mount.
//   3. Neither → warn the user and abort.
// ════════════════════════════════════════════════════════════════════════════

import api from "@/utils/api";
import { toastAlert } from "@/utils/helpers";

type Router = {
  push: (url: string) => void;
};

type StoreSetters = {
  setSchemeData: (scheme: any) => void;
  setInvestors: (list: any[]) => void;
  setDataSource: (mode: "MFU" | "NSE") => void;
};

const hasCanOnFile = (inv: any): boolean => {
  if (!inv) return false;
  if (inv.is_CAN_registered !== true) return false;
  const canId = inv?.InvestorAccountHolding?.[0]?.CAN_Id;
  return !!canId && String(canId).trim() !== "";
};

const hasInlineUcc = (inv: any): boolean => {
  if (!inv) return false;
  return (
    inv?.UCCRegistration?.clientCode ||
    inv?.UCCRegistration?.ucc_created === 1 ||
    inv?.ucc_client_code ||
    inv?.uccCreated === 1 ||
    inv?.uccCreated === true ||
    inv?.ucc_created === true
  );
};

const fetchUccByMobile = async (mobile: string | undefined | null) => {
  if (!mobile) return null;
  try {
    const res = await api.get(`/nse/ucc/search-by-mobile/${mobile}`);
    const payload = res?.data?.data ?? res?.data ?? {};
    if (payload?.status === "S" && payload?.data) {
      const u = payload.data;
      const ok = u?.uccCreated === 1 || u?.uccCreated === true || !!u?.clientCode;
      return ok ? u : null;
    }
  } catch {
    // UCC service may legitimately return 404 for non-NSE investors.
  }
  return null;
};

const buildNseOrderUrl = (scheme: any, ucc?: any) => {
  const isin = (scheme?.schemeISIN || scheme?.isin || "").toString().trim();
  const params = new URLSearchParams({
    // Pass the ISIN as both scheme_code AND isin — the /nse-order-form mount
    // guard detects the ISIN shape and auto-resolves it to the canonical NSE
    // scheme_code via /nse/scheme/resolve-by-isin before rendering.
    scheme_code: isin,
    scheme_name: scheme?.name || scheme?.ms_fullname || "",
    amc_code: scheme?.nse_amc_code || scheme?.amc_code || "",
    isin,
    min_amount:
      scheme?.nse_min_purchase_amount || scheme?.min_purchase_amount || "100",
  });
  return `/nse-order-form?${params.toString()}`;
};

export interface RouteInvestorArgs {
  router: Router;
  scheme: any;
  investorList: any[];
  store: StoreSetters;
  /**
   * Invoked before the navigation happens. Use it to show a
   * FullPageLoader / "Processing..." overlay in the caller.
   */
  onStart?: () => void;
  /**
   * Invoked after the navigation has been scheduled (success or fallback).
   * Use it to hide the overlay.
   */
  onFinish?: () => void;
}

/**
 * Decide the right order-form route for this investor + scheme and navigate.
 * Always resolves — never throws. Shows a toast on unrecoverable errors.
 */
export const routeInvestorToOrderForm = async ({
  router,
  scheme,
  investorList,
  store,
  onStart,
  onFinish,
}: RouteInvestorArgs): Promise<void> => {
  if (!scheme) {
    toastAlert("error", "No scheme selected");
    return;
  }
  if (!investorList || investorList.length === 0) {
    toastAlert("error", "No investor linked to this account");
    return;
  }

  const investor = investorList[0];
  onStart?.();

  try {
    // 1. CAN short-circuit — MFU lane.
    if (hasCanOnFile(investor)) {
      store.setSchemeData(scheme);
      store.setInvestors(investorList);
      store.setDataSource("MFU");
      router.push("/mutual-fund/new-order");
      return;
    }

    // 2. Inline UCC hint — NSE lane, no extra network call.
    if (hasInlineUcc(investor)) {
      store.setSchemeData(scheme);
      store.setInvestors(investorList);
      store.setDataSource("NSE");
      router.push(buildNseOrderUrl(scheme, investor));
      return;
    }

    // 3. No inline hints — ask the backend whether a UCC exists for this mobile.
    const mobile =
      investor?.reg_mobile ||
      investor?.mobile ||
      investor?.indianMobileNo ||
      investor?.InvestorRegistration?.reg_mobile;
    const ucc = await fetchUccByMobile(mobile);
    if (ucc) {
      store.setSchemeData(scheme);
      store.setInvestors(investorList);
      store.setDataSource("NSE");
      router.push(buildNseOrderUrl(scheme, ucc));
      return;
    }

    // 4. Nothing to execute with.
    toastAlert(
      "error",
      "This investor has neither a CAN nor a UCC on file. Complete onboarding before placing an order."
    );
  } finally {
    onFinish?.();
  }
};
