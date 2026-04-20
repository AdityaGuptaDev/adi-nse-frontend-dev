import { useEffect, useRef, useState, useMemo } from "react";
import CustomButton from "@/commonUI/Button";
import { ArrowLeft, Search } from "lucide-react";
import { searchByISIN, searchByCan } from "@/api/transaction";
import OrderPopup from "@/components/fund-explore/order";
import api from "@/utils/api";
import { toast } from "react-toastify";

interface InvestorPopupProps {
    modalId?: string;
    showTriggerButton?: boolean;
    schemeData?: any;
    open: boolean;
    onClose: () => void;
}


interface Investor {
    id: number;
    name: string;
    dob: string;
    pan_no: string;
    reg_email: string;
    reg_mobile: string;
    Gender?: { id: string; gender: string };
    TaxStatus?: { id: string; status: string };
    GroupLeader?: { id: number | null; name: string | null };
    is_kyc_complete: boolean;
    is_CAN_registered: boolean;
}


const InvestorPicker: React.FC<InvestorPopupProps> = ({
    modalId = "InvestorModel",
    schemeData,
    open,
    onClose,
}) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [investorList, setInvestorList] = useState<Investor[]>([]);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [sipData, setSipData] = useState<any[]>([]);


    const _canId = '14163BEA01';

    useEffect(() => {
        if (open) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [open]);




    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [total, setTotal] = useState(0);

    // Search filter
    const [search, setSearch] = useState("");

    const filteredInvestors = useMemo(() => {
        return investorList.filter((inv) => {
            const query = search.toLowerCase();

            return (
                inv.name.toLowerCase().includes(query) ||
                inv.pan_no.toLowerCase().includes(query) ||
                inv.reg_email.toLowerCase().includes(query) ||
                inv.reg_mobile.toLowerCase().includes(query)
            );
        });
    }, [search, investorList]);



    useEffect(() => {
        fetchInvestors();
    }, [page, search]);

    const fetchInvestors = async () => {
        try {
            let params: any = { page, limit };
            if (search.trim()) params.search = search;

            let { data } = await api.get("/investor/getAllInvestorListWithCan", { params });
            setInvestorList(data?.data?.rows || []);
            console.log(investorList)
            setTotal(data?.data?.count || 0);
        } catch (error) {
            console.error("Error fetching investors:", error);
        }
    };

    const handleNext = () => {
        if (!selectedInvestor) {
            alert("Please select an investor.");
            return;
        }
        setShowOrderPopup(true);
    };

    const totalPages = Math.ceil(total / limit);

    const handleSelection = (inv: any) => {
        console.log("Selected Investor is :-", inv)
        setSelectedInvestor(inv)
        toast.error("Hello")
    }

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

    useEffect(() => {
        const fetchByCan = async () => {
            try {
                const response = await searchByCan(_canId);
                const records = response?.data?.data?.data || [];
                console.log("Transaction - searchByCan:", records);
                //setInvestorList(records); // Populate investors from API
            } catch (error) {
                console.log('Error fetching CAN data:', error);
            }
        };

        fetchByCan();
    }, [_canId]);

    return (
        <>
            <dialog ref={modalRef} className="modal" id={modalId}>
                <div className="modal-box max-w-7xl w-full rounded-xl shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <ArrowLeft
                                className="w-5 h-5 cursor-pointer text-[#9CA3AF]"
                                onClick={onClose}
                            />
                            <h3 className="font-semibold text-lg text-[#F9FAFB]">
                                Select an Investor
                            </h3>
                        </div>
                    </div>


                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search by Name, PAN, or Mobile..."
                                className="w-full border rounded-lg px-4 py-2 pl-10 text-sm focus:ring focus:ring-blue-100"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto max-h-[400px] border rounded-lg">
                        <table className="table-auto w-full text-sm">
                            <thead className="bg-[#1F1A1A] text-[#E5E7EB]">
                                <tr>
                                    <th className="px-3 py-2 text-left">Select</th>
                                    <th className="px-3 py-2">ID</th>
                                    <th className="px-3 py-2">Name</th>
                                    <th className="px-3 py-2">DOB</th>
                                    <th className="px-3 py-2">PAN</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Mobile</th>
                                    <th className="px-3 py-2">Gender</th>
                                    <th className="px-3 py-2">Tax Status</th>
                                    <th className="px-3 py-2">Group Leader</th>
                                    <th className="px-3 py-2">KYC</th>
                                    <th className="px-3 py-2">CAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvestors.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="text-center py-6 text-[#9CA3AF]">
                                            No investors found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvestors.map((inv: Investor) => (
                                        <tr
                                            key={inv.id}
                                            className={`hover:bg-[#1F1A1A] ${selectedInvestor?.id === inv.id ? "bg-[#2A2A2A]" : ""
                                                }`}
                                        >
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="radio"
                                                    name="investor"
                                                    value={inv.id}
                                                    checked={selectedInvestor?.id === inv.id}
                                                    onChange={() => handleSelection(inv)}
                                                    disabled={!inv.is_kyc_complete || !inv.is_CAN_registered}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                            </td>
                                            <td className="px-3 py-2">{inv.id}</td>
                                            <td className="px-3 py-2">{inv.name}</td>
                                            <td className="px-3 py-2">{inv.dob}</td>
                                            <td className="px-3 py-2">{inv.pan_no}</td>
                                            <td className="px-3 py-2">{inv.reg_email}</td>
                                            <td className="px-3 py-2">{inv.reg_mobile}</td>
                                            <td className="px-3 py-2">{inv.Gender?.gender}</td>
                                            <td className="px-3 py-2">{inv.TaxStatus?.status}</td>
                                            <td className="px-3 py-2">{inv.GroupLeader?.name || "-"}</td>
                                            <td className="px-3 py-2">
                                                {inv.is_kyc_complete ? (
                                                    <span className="text-green-600 font-medium">Complete</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {inv.is_CAN_registered ? (
                                                    <span className="text-green-600 font-medium">Yes</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-sm">
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Prev
                            </button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <CustomButton onClick={handleNext}>Next</CustomButton>
                    </div>
                </div>
            </dialog>

            {showOrderPopup && selectedInvestor && (
                <OrderPopup
                    schemeData={schemeData}
                    investor={selectedInvestor}
                    sipData={[]}
                    source={"Fund Explorer"}
                    open={showOrderPopup}
                    onClose={() => setShowOrderPopup(false)}
                />
            )}
        </>
    );
};

export default InvestorPicker;

