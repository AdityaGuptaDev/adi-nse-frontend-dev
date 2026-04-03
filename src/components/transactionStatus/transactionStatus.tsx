import React from "react";

interface Transaction {
  id: string;
  fund: string;
  category: string;
  orderNo: string;
  folioNo: string;
  amount: number;
  status: "Success" | "Failed";
  sipDay?: number;
  mandateCode?: string;
}

// Custom Button component for this example
const CustomButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <button className={className}>{children}</button>;

const TransactionStatus = () => {
  const transactions: Transaction[] = [
    {
      id: "1",
      fund: "KOTAK - EMERGING EQUITY (G)",
      category: "Equity - Large Cap",
      orderNo: "1234567890",
      folioNo: "09876543321",
      amount: 15000,
      status: "Success",
      sipDay: 15,
      mandateCode: "1234",
    },
    {
      id: "2",
      fund: "KOTAK - EMERGING EQUITY (G)",
      category: "Equity - Large Cap",
      orderNo: "1234567890",
      folioNo: "09876543321",
      amount: 15000,
      status: "Failed",
    },
    {
      id: "3",
      fund: "KOTAK - EMERGING EQUITY (G)",
      category: "Equity - Large Cap",
      orderNo: "1234567890",
      folioNo: "09876543321",
      amount: 15000,
      status: "Success",
    },
    {
      id: "4",
      fund: "KOTAK - EMERGING EQUITY (G)",
      category: "Equity - Large Cap",
      orderNo: "1234567890",
      folioNo: "New",
      amount: 5000,
      status: "Success",
      sipDay: 15,
      mandateCode: "1234",
    },
    {
      id: "5",
      fund: "KOTAK - EMERGING EQUITY (G)",
      category: "Equity - Large Cap",
      orderNo: "1234567890",
      folioNo: "New",
      amount: 5000,
      status: "Failed",
      sipDay: 15,
      mandateCode: "1234",
    },
  ];

  return (
    <div className="max-w-8xl mx-auto">
      <div className="bg-white rounded-lg">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-2xl font-normal text-base-content">
            Transaction Status
          </h1>
        </div>

        {/* Transactions */}
        <div className="px-4 flex flex-col mb-8">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`${index !== 0 ? "mt-5" : ""}`}
            >
              <div className="grid grid-cols-8 gap-4 items-start py-6 border border-field-border px-4 rounded-[20px]">
                {/* Fund Information */}
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-base-content mb-1">
                    {transaction.fund}
                  </h3>
                  <p className="text-xs text-base-content">
                    {transaction.category}
                  </p>
                </div>

                {/* SIP Day */}
                <div className="col-span-1">
                  {transaction.sipDay && (
                    <>
                      <p className="text-xs text-base-content mb-1">SIP Day</p>
                      <p className="text-sm font-medium text-base-content">
                        {transaction.sipDay}
                      </p>
                    </>
                  )}
                </div>

                {/* Mandate Code */}
                <div className="col-span-1">
                  {transaction.mandateCode && (
                    <>
                      <p className="text-xs text-base-content mb-1">
                        Mandate Code
                      </p>
                      <p className="text-sm font-medium text-base-content">
                        {transaction.mandateCode}
                      </p>
                    </>
                  )}
                </div>

                {/* Order No */}
                <div className="col-span-1">
                  <p className="text-xs text-base-content mb-1">Order No.</p>
                  <p className="text-sm font-medium text-base-content">
                    {transaction.orderNo}
                  </p>
                </div>

                {/* Folio No */}
                <div className="col-span-1">
                  <p className="text-xs text-base-content mb-1">Folio No.</p>
                  <p className="text-sm font-medium text-base-content">
                    {transaction.folioNo}
                  </p>
                </div>

                {/* Amount */}
                <div className="col-span-1">
                  <p className="text-xs text-base-content mb-1">Amount</p>
                  <p className="text-sm font-medium text-base-content">
                    ₹ {transaction.amount.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <p className="text-xs text-base-content mb-1">Status</p>
                  <p
                    className={`text-sm font-medium ${
                      transaction.status === "Success"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OK Button */}
        <div className="flex justify-center pb-8">
          <CustomButton className="bg-primary w-32 rounded-xl px-8 py-3 text-white cursor-pointer">
            Ok
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
