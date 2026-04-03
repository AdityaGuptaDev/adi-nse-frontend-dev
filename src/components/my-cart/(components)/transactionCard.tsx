import React from "react";
import { FaPen, FaTrash } from "react-icons/fa";

export type TransactionType =
    | "Lumpsum"
    | "SIP"
    | "STP"
    | "SWP"
    | "Switch"
    | "Redeem";

interface Props {
    type: TransactionType | string;
    scheme: string;
    folio: string;
    amount: number;
    details?: Record<string, string>;
    isNew?: boolean;
    isAdd?: boolean;
    editable?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function TransactionCard({
    type,
    scheme,
    folio,
    amount,
    details = {},
    isNew,
    isAdd,
    editable = false,
    onEdit,
    onDelete,
}: Props) {

    // Define keys to control layout
    const paragraphKeys = ["category", "subcategory"];
    const flexColumnKeys = ["frequency", "day", "start_month", "start_year"];
    const Frequencies = [
        { code: "D", description: "Daily" },
        { code: "M", description: "Monthly" },
        { code: "Q", description: "Quaterly" },
        { code: "Y", description: "Yearly" },
    ]

    return (
        <div className="group mt-1 relative rounded-xl border border-gray-200 p-4 bg-white shadow-none hover:shadow-md transition">
            <div className="flex justify-between items-start sm:gap-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isNew && (
                            <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                                New
                            </span>
                        )}
                        {isAdd && (
                            <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                                Add
                            </span>
                        )}
                        <span className="text-gray-800 font-semibold">{scheme}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center justify-between flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-10">

                            <p className="text-sm text-black"><span className="text-black/50">Folio: </span><br/>{folio}</p>
                            <p className="text-sm text-blue-500 font-medium"><span>Type: </span><br/>{type}</p>



                            {Object.entries(details)
                                .filter(([key]) => paragraphKeys.includes(key))
                                .map(([key, value]) => (
                                    <p key={key} className="text-sm text-black capitalize">
                                        <span className="text-black/50">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}: </span><br/>{value}
                                    </p>
                                ))}

                        </div>

                        {type === 'SIP' &&
                            <div className="grid grid-cols-2 sm:grid-cols-4 mt-0 gap-2 sm:gap-10">
                                {Object.entries(details)
                                    .filter(([key]) => flexColumnKeys.includes(key))
                                    .map(([key, value]) => (
                                        <div key={key} className="text-sm text-black gap-5 capitalize">
                                            <span className="text-black/50">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}:</span><br/>
                                            <span>{key === "frequency" ? Frequencies.find(opt => opt.code === value)?.description : value}</span>
                                        </div>
                                    ))}
                            </div>
                        }
                    </div>

                </div>

                <div className="flex flex-col items-end">
                    <span className="text-green-600 font-bold text-sm">
                        ₹{amount.toLocaleString()}
                    </span>
                    {editable && (
                        <div className="flex gap-2 mt-2 sm:opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                            <FaPen
                                className="cursor-pointer hover:text-blue-600"
                                onClick={onEdit}
                            />
                            <FaTrash
                                className="cursor-pointer hover:text-red-600"
                                onClick={onDelete}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
