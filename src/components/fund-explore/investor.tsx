import { useEffect, useRef, useState } from "react";
import CustomButton from "@/commonUI/Button";
import { ArrowLeft } from "lucide-react";
import OrderPopup from "./order";
import { searchByISIN, searchByCan } from "@/api/transaction";
import { TAX_STATUS } from "@/utils/constants";

interface InvestorPopupProps {
    modalId?: string;
    showTriggerButton?: boolean;
    schemeData?: any;
    open: boolean;
    investor: any;
    onClose: () => void;
}

interface Investor {
    first_applicant?: string;
    scheme?: string;
    pri_isin: string;
    rtaAmcCode: string;
    rtaSchCode: string;
    can_id: string;
    investory_category: string;
    holding_mode: string;
    joint1?: string;
    joint2?: string;
    nominee?: string;
}



const InvestorPopup: React.FC<InvestorPopupProps> = ({
    modalId = "InvestorModel",
    schemeData,
    open,
    investor,
    onClose,
}) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [investorList, setInvestorList] = useState<Investor[]>([]);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [sipData, setSipData] = useState<any[]>([]);


    useEffect(() => {
        if (open) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [open]);

    useEffect(() => {
        const fetchByISIN = async () => {
            try {
                const response = await searchByISIN(schemeData?.schemeISIN);
                const records = response?.data?.data?.data || [];
                setSipData(records)
                console.log("Transaction - searchByISIN:", records);
            } catch (error) {
                console.log('Error fetching ISIN data:', error);
            }
        };

        if (schemeData?.schemeISIN) {
            fetchByISIN();
        }
    }, [schemeData?.schemeISIN]);

    /*useEffect(() => {
        const fetchByCan = async () => {
            try {
                const response = await searchByCan(_canId);
                const records = response?.data?.data?.data || [];
                console.log("Transaction - searchByCan:", records);
                setInvestorList(records); // Populate investors from API
            } catch (error) {
                console.log('Error fetching CAN data:', error);
            }
        };

        fetchByCan();
    }, [_canId]);*/

    const handleNext = () => {
        console.log(selectedInvestor)


        if (!selectedInvestor) {
            alert("Please select an investor.");
            return;
        }
        //modalRef.current?.close();
        //console.log(sipData)
        setShowOrderPopup(true);
    };

    return (
        <>
            <dialog ref={modalRef} className="modal" id={modalId}>
                <div className="modal-box max-w-6xl w-full rounded-xl">
                    <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onClose} />

                    <div className="text-center border-b border-accent pb-4 mb-4">
                        <h3 className="font-semibold text-md text-gray-950">
                            Choose an Investing Profile
                        </h3>
                    </div>

                    <div className="overflow-auto max-h-[400px] border rounded-lg">
                        <table className="table-auto w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Select</th>
                                    {/*<th className="px-3 py-2">ARN</th>*/}
                                    <th className="px-3 py-2">IIN/CAN/UCC</th>
                                    <th className="px-3 py-2">First Holder</th>
                                    <th className="px-3 py-2">Tax Status</th>
                                    <th className="px-3 py-2">Holding Nature</th>
                                    <th className="px-3 py-2">Joint 1</th>
                                    <th className="px-3 py-2">Joint 2</th>
                                    <th className="px-3 py-2">Nominee</th>
                                    <th className="px-3 py-2">Can Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investor.map((inv: any, index: any) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-blue-50 ${selectedInvestor?.can_id === inv.can_id ? "" : ""
                                            }`}
                                    >
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="radio"
                                                name="investor"
                                                value={inv.can_id}
                                                className="w-4 h-4 text-blue-600"
                                                //checked={selectedInvestor?.can_id === inv.can_id}
                                                onChange={() => setSelectedInvestor(inv)}
                                                disabled={!inv.is_kyc_complete || !inv.is_CAN_registered}
                                            />
                                        </td>
                                        {/*<td className="px-3 py-2">ARN-104974</td>*/}
                                        <td className="px-3 py-2">{inv.InvestorAccountHolding[0]?.CAN_Id}</td>
                                        <td className="px-3 py-2">{inv.name} </td>
                                        <td className="px-3 py-2">  {TAX_STATUS.find((opt: any) => String(opt.code) == String(inv.tax_status))?.label || inv.tax_status}</td>
                                        <td className="px-3 py-2">{inv?.InvestorAccountHolding[0]?.account_holding_type}</td>
                                        <td className="px-3 py-2">{inv.joint1 || "-"}</td>
                                        <td className="px-3 py-2">{inv.joint2 || "-"}</td>
                                        <td className="px-3 py-2">{inv.nominee || "-"}</td>

                                        <td className="px-3 py-2">
                                            {inv.is_CAN_registered ? (
                                                <span className="text-green-600 font-medium">Complete</span>
                                            ) : (
                                                <span className="text-red-600 font-medium">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-center mt-6">
                        <CustomButton onClick={handleNext}>Next</CustomButton>
                    </div>
                </div>
            </dialog>

            {showOrderPopup && selectedInvestor && (
                <OrderPopup
                    schemeData={schemeData}
                    investor={selectedInvestor}
                    investorList={investor}
                    sipData={sipData}
                    source={"Fund Explorer"}
                    open={showOrderPopup}
                    onClose={() => setShowOrderPopup(false)}
                />
            )}
        </>
    );
};

export default InvestorPopup;
