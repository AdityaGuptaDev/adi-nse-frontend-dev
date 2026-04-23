"use client";

import { useEffect, useState } from "react";
import { StepComponentProps } from "../types";
import api from "@/utils/api";
import { USER_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";
import ErrorDialog from "@/commonUI/ErrorDialog";
import { useRouter } from "next/navigation";
import { fetchHolderDetails } from "@/api/kyc";
import { toast } from "react-toastify";

import {
    relationshipTypeOptions, holdingNature, TaxStatus, country, declarationOptions,
    incomeOptions, investorCategory, kraAddressType, occupationOptions, sourceOfWealthOptions
} from '../parser/index'


export default function SummaryFinalization({
    onPrevious,
    investorId,
}: StepComponentProps) {
    // Get user data once
    const user: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);
    const router = useRouter();

    const [summary, setSummary] = useState<any>(null);
    const [loader, setLoader] = useState(false);
    const [isError, setIsError] = useState(false);
    const [transactionData, setTransactionData] = useState<any>({});






    useEffect(() => {
        if (!user?.InvestorRegistration?.id) return;

        const loadData = async () => {
            try {
                const res = await fetchHolderDetails(user.InvestorRegistration.id);
                const data = res?.data?.data?.data;

                // Deduplicate basicDetails by DOB+PAN so legacy duplicate rows
                // (from the pre-fix create-instead-of-update path) don't show
                // up as extra holders. Sort by id ASC so the primary (inserted
                // first) stays at index 0 and the secondary at index 1 — the
                // title mapping below depends on that order.
                const rawHolders: any[] = Array.isArray(data?.basicDetails)
                    ? data.basicDetails
                    : [];
                const sortedHolders = [...rawHolders].sort(
                    (a: any, b: any) => (a?.id ?? 0) - (b?.id ?? 0)
                );
                const seen = new Set<string>();
                const dedupedHolders = sortedHolders.filter((h: any) => {
                    const key = `${h?.date_of_birth ?? ''}|${h?.pan_pek ?? ''}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                setSummary({
                    canCriteria: {
                        holdingNature: holdingNature.find((opt: any) => opt.value == data?.registration?.holding_nature)?.label,
                        investorCategory: investorCategory.find((opt: any) => opt.value == data?.registration?.investor_category)?.label,
                        taxStatus: TaxStatus.find(
                            (opt: any) => opt.value === data?.registration?.tax_status?.toString()
                        )?.label ?? "",
                        holdersCount: data?.registration?.holders,
                        holdingNatureCode: data?.registration?.holding_nature,
                    },

                    holders: dedupedHolders.map((h: any, i: number) => ({
                        title: i === 0 ? "Primary Holder" : `Secondary Holder`,
                        ...h,
                    })),

                    additionalKyc: data?.additionalKyc || [],
                    fatca: data?.fatca || [],
                    bankDetails: data?.bankDetails || [],
                    nominees: data?.nomineeDetails || [],
                });
            } catch (e) {
                console.error("Summary load failed", e);
            }
        };

        loadData();
    }, [user?.InvestorRegistration?.id]);

    // Expected holder count — JO/AS needs 2 rows, anything else needs 1.
    // We compare against this to decide whether Finalize & Submit can proceed.
    const expectedHolderCount =
        summary?.canCriteria?.holdingNatureCode === "JO" ||
        summary?.canCriteria?.holdingNatureCode === "AS"
            ? 2
            : 1;
    const hasAllHolders =
        (summary?.holders?.length || 0) >= expectedHolderCount;

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        // Stop early when the Secondary Holder is missing for JO/AS.
        // MFU would otherwise reject with "Second Holder Details should not be
        // blank" (code 10083), giving the user a cryptic error dialog instead
        // of a clear next action.
        if (!hasAllHolders) {
            toast.error(
                "Secondary Holder details are missing. Please go back and complete the Secondary Holder step before finalising.",
                { autoClose: 6000 },
            );
            return;
        }

        setLoader(true);
        try {
            const response = await api.post(`/kyc/CAN-creation`, {
                investor_id: investorId,
            });

            const result =
                response?.data?.data?.canResponse?.CANIndFillEezzResp;

            const resCode: string = result?.RESP_HEADER?.RES_CODE || "";

            if (resCode === "0") {
                // Success — clear any lingering PAN-edit flag from a previous
                // failed attempt.
                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("panEditRequired");
                }
                router.push("/can-onboarding");
                return;
            }

            if (resCode === "16094") {
                // MFU idempotency hit: "CAN already exists for the same
                // combination". Backend has already flipped is_CAN_registered
                // on this investor. Treat as success, inform the user, and
                // forward to the CAN onboarding flow.
                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("panEditRequired");
                }
                toast.info(
                    "A CAN is already registered with this PAN at MFU. You're being taken to the next step. Please contact support if your CAN number is not visible.",
                    { autoClose: 6000 },
                );
                router.push("/can-onboarding");
                return;
            }

            // Any other non-zero RES_CODE is a real failure.
            const status: string = result?.RESP_HEADER?.RES_MSG || "";
            setIsError(true);
            setTransactionData({ status, code: resCode });

            // Detect the "KYC Not Registered with KRA for ( <PAN> )" case.
            // When it fires, the user's only recovery is to go back to the
            // holder step and change the PAN. Flag that in sessionStorage
            // so SolePrimaryHolder knows to unlock its PAN input — we keep
            // the field locked in the normal flow because the PAN is
            // supposed to be immutable after identity verification.
            if (/KYC\s+Not\s+Registered\s+with\s+KRA/i.test(status)) {
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("panEditRequired", "true");
                }
            }
        } catch (err) {
            setIsError(true);
        } finally {
            setLoader(false);
        }
    };

    // Route the user back to the Sole/Primary Holder step where they can
    // correct the PAN. Closes the error dialog first so it doesn't linger.
    const handleEditPan = () => {
        setIsError(false);
        onPrevious?.();
        onPrevious?.();
        onPrevious?.();
        // Summary → Nominees → Bank Accounts → Sole/Primary Holder — three
        // steps back in the current wizard layout. onPrevious is a no-op at
        // the first step, so over-calling is safe.
    };

    // Summary → Nominees → Bank Accounts → Secondary Holder — three steps
    // back when holding_nature is JO/AS. onPrevious is a no-op at the first
    // step, so this is safe even if the step list changes.
    const goToSecondaryHolder = () => {
        onPrevious?.();
        onPrevious?.();
        onPrevious?.();
    };

    // True when the most recent failure was the KRA-registration case.
    const canEditPan =
        isError &&
        /KYC\s+Not\s+Registered\s+with\s+KRA/i.test(
            transactionData?.status || ""
        );

    if (!summary) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#F59E0B]" />
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-7xl mx-auto p-8 bg-[#0A0A0A] min-h-screen">
            <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                Review & Finalize Details
            </h1>

            <ErrorDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
                title="CAN Creation Failed"
                message="Unable to process your request"
                errorDetails={transactionData}
                note={
                    canEditPan
                        ? "This PAN is not registered with KRA. Please go back and correct the PAN, then resubmit."
                        : "Please contact support"
                }
                primaryAction={
                    canEditPan
                        ? { label: "Edit PAN and Retry", onClick: handleEditPan }
                        : undefined
                }
            />

            {/* ================= CRITERIA ================= */}
            <SummarySection title="eCAN Criteria">
                <Card >
                    <GridField label="Holding Nature" value={summary.canCriteria.holdingNature} />
                    <GridField label="Investor Category" value={summary.canCriteria.investorCategory} />
                    <GridField label="Tax Status" value={summary.canCriteria.taxStatus} />
                    <GridField label="No. of Holders" value={summary.canCriteria.holdersCount} />
                </Card>
            </SummarySection>

            {/* ================= HOLDERS ================= */}
            <SummarySection title="Holders">
                {!hasAllHolders && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="font-semibold text-red-300">
                                Secondary Holder details missing
                            </p>
                            <p className="text-sm text-red-200/80 mt-1">
                                This is a {summary.canCriteria.holdingNature} account and
                                needs {expectedHolderCount} holders. MFU will reject CAN
                                creation until the Secondary Holder is filled in.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={goToSecondaryHolder}
                            className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white text-sm font-medium hover:opacity-90"
                        >
                            Go to Secondary Holder
                        </button>
                    </div>
                )}
                {summary.holders.map((h: any, idx: number) => (
                    <Card key={idx} title={h.title}>
                        <GridField label="Name" value={h.name} />
                        <GridField label="DOB" value={h.date_of_birth} />
                        <GridField label="Gender" value={h.gender} />
                        <GridField label="Mobile" value={h.mobile_number} />
                        <GridField label="Email" value={h.email} />
                    </Card>
                ))}
            </SummarySection>

            {/* ================= ADDITIONAL KYC ================= */}
            <SummarySection title="Additional KYC">
                {summary.additionalKyc.map((k: any, idx: number) => (
                    <Card key={idx}>
                        <GridField label="Income" value={incomeOptions.find((opt: any) => opt.value == k.gross_annual_income)?.label} />
                        <GridField label="Source of Wealth" value={sourceOfWealthOptions.find((opt: any) => opt.value == k.source_of_wealth)?.label} />
                        <GridField label="Occupation" value={occupationOptions.find((opt: any) => opt.value == k.occupation)?.label} />
                        <GridField label="Political Exposure" value={k.political_exposure} />
                        <GridField label="KRA Address Type" value={kraAddressType.find((opt: any) => opt.value == k.kra_address_type)?.label} />
                    </Card>
                ))}
            </SummarySection>

            {/* ================= FATCA ================= */}
            <SummarySection title="FATCA">
                {summary.fatca.map((f: any, idx: number) => (
                    <Card key={idx}>
                        <GridField label="Tax Resident Outside India" value={f.is_tax_resident_other_than_india || "No"} />
                        <GridField label="Place of Birth" value={f.place_of_birth} />
                        <GridField label="Country of Birth" value={country.find((opt: any) => opt.value == f.country_of_birth)?.label} />
                        <GridField label="Nationality" value={country.find((opt: any) => opt.value == f.country_of_nationality)?.label} />
                        <GridField label="Citizenship" value={country.find((opt: any) => opt.value == f.country_of_citizenship)?.label} />
                    </Card>
                ))}
            </SummarySection>

            {/* ================= BANKS ================= */}
            <SummarySection title="Bank Accounts">
                {summary.bankDetails.map((b: any, idx: number) => (
                    <Card key={idx}>
                        <GridField label="Account No" value={b.account_no} />
                        <GridField label="Account Type" value={b.account_type} />
                        <GridField label="IFSC" value={b.ifsc} />
                        <GridField label="MICR" value={b.micr} />
                    </Card>
                ))}
            </SummarySection>

            {/* ================= NOMINEES ================= */}
            <SummarySection title="Nominees">
                {summary.nominees.map((n: any, idx: number) => (
                    <Card key={idx}>
                        <GridField label="Name" value={n.nominee_name} />
                        <GridField label="Relation" value={relationshipTypeOptions.find((opt: any) => opt.value == n.relation)?.label} />
                        <GridField label="DOB" value={n.nominee_DOB} />
                        <GridField label="Allocation %" value={`${n.percentage_allocation}%`} />
                    </Card>
                ))}
            </SummarySection>

            {/* ================= FOOTER ================= */}
            <div className="flex justify-between mt-12 border-t border-[#2A2A2A] pt-6">
                <Button variant="secondary" onClick={onPrevious}>
                    Previous
                </Button>

                <Button
                    onClick={handleSubmit}
                    loading={loader}
                    disabled={!hasAllHolders}
                    title={
                        !hasAllHolders
                            ? "Complete the Secondary Holder step to finalise"
                            : undefined
                    }
                >
                    Finalize & Submit
                </Button>
            </div>
        </div>
    );
}

/* ================= UI HELPERS ================= */

function SummarySection({ title, children }: any) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-[#F9FAFB]">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Card({ title, children }: any) {
    return (
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-lg p-6">
            {title && <p className="font-semibold mb-4 text-[#F59E0B]">{title}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
        </div>
    );
}

function GridField({ label, value }: any) {
    return (
        <div>
            <p className="text-xs text-[#9CA3AF] mb-1">{label}</p>
            <p className="font-medium text-[#F9FAFB]">{value || "-"}</p>
        </div>
    );
}

function Button({ children, loading, disabled, variant = "primary", ...props }: any) {
    const isDisabled = loading || disabled;
    const base =
        "px-6 py-2 rounded-lg font-medium transition flex items-center justify-center shadow-sm";
    const activeStyles =
        variant === "secondary"
            ? "bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:border-[#F59E0B] transition-all"
            : "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90";
    const disabledStyles = "bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed";
    const styles = isDisabled && !loading ? disabledStyles : activeStyles;

    return (
        <button {...props} disabled={isDisabled} className={`${base} ${styles}`}>
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Please wait...
                </span>
            ) : (
                children
            )}
        </button>
    );
}