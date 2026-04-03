"use client";

import { useEffect, useState } from "react";
import { StepComponentProps } from "../types";
import api from "@/utils/api";
import { USER_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";
import ErrorDialog from "@/commonUI/ErrorDialog";
import { redirect } from "next/navigation";
import { fetchHolderDetails } from "@/api/kyc";

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

                setSummary({
                    canCriteria: {
                        holdingNature: holdingNature.find((opt: any) => opt.value == data?.registration?.holding_nature)?.label,
                        investorCategory: investorCategory.find((opt: any) => opt.value == data?.registration?.investor_category)?.label,
                        taxStatus: TaxStatus.find(
                            (opt: any) => opt.value === data?.registration?.tax_status?.toString()
                        )?.label ?? "",
                        holdersCount: data?.registration?.holders,
                    },

                    holders: (data?.basicDetails || []).map((h: any, i: number) => ({
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

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        setLoader(true);
        try {
            const response = await api.post(`/kyc/CAN-creation`, {
                investor_id: investorId,
            });

            const result =
                response?.data?.data?.canResponse?.CANIndFillEezzResp;

            if (result?.RESP_HEADER?.RES_CODE !== "0") {
                setIsError(true);
                setTransactionData({
                    status: result?.RESP_HEADER?.RES_MSG,
                    code: result?.RESP_HEADER?.RES_CODE,
                });
            } else {
                redirect("/can-onboarding");
            }
        } catch (err) {
            setIsError(true);
        } finally {
            setLoader(false);
        }
    };

    if (!summary) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">
                Review & Finalize Details
            </h1>

            <ErrorDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
                title="CAN Creation Failed"
                message="Unable to process your request"
                errorDetails={transactionData}
                note="Please contact support"
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
            <div className="flex justify-between mt-12 border-t pt-6">
                <Button variant="secondary" onClick={onPrevious}>
                    Previous
                </Button>

                <Button onClick={handleSubmit} loading={loader}>
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
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Card({ title, children }: any) {
    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            {title && <p className="font-semibold mb-4">{title}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
        </div>
    );
}

function GridField({ label, value }: any) {
    return (
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="font-medium text-gray-900">{value || "-"}</p>
        </div>
    );
}

function Button({ children, loading, variant = "primary", ...props }: any) {
    const base =
        "px-6 py-2 rounded-md font-medium transition flex items-center justify-center";
    const styles =
        variant === "secondary"
            ? "bg-gray-600 text-white hover:bg-gray-700"
            : "bg-blue-600 text-white hover:bg-blue-700";

    return (
        <button {...props} disabled={loading} className={`${base} ${styles}`}>
            {loading ? "Please wait..." : children}
        </button>
    );
}