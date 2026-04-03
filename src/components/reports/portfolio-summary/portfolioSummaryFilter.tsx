import { useEffect, useState } from "react";
import { getAMCList, getCategoryList, getNatureList } from "@/api/fund-picker";
import { MultiSelect } from "react-multi-select-component";
import CustomRadio from "@/commonUI/Radio";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomLabel from "@/commonUI/Label";
import CustomInput from "@/commonUI/Input";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CustomButton from "@/commonUI/Button";
import CustomSelect from "@/commonUI/Select";
import CustomText from "@/commonUI/Text";

const PortfolioSummary = ({ isOpen, handleClose, setPayload }: any) => {
  const [viewType, setViewType] = useState("On Screen");
  const [selectedAssetClass, setSelectedAssetClass] = useState("Mutual Fund");
  const [selectedGroup, setSelectedGroup] = useState("Category");
  const [selectedData, setSelectedData] = useState("Investment snapshot");
  const [selectedAllocations, setSelectedAllocations] = useState("Investor");
  const [mfAllocation, setMfAllocations] = useState("Fund");
  const [reportType, setReportType] = useState("Category");
  const [emailViewType, setEmailViewType] = useState("CC Relationship Manager");
  const [selectedInvestor, setSelectedInvestor] = useState<any>([]);
  const [selectedSource, setSelectedSource] = useState<any>([]);
  const [reportDate, setReportDate] = useState("23-06-2025");
  const [selectedHoldingPeriod, setSelectedHoldingPeriod] = useState<any>([]);
  const [selectedTransactionType, setSelectedTransactionType] = useState<any>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<any>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>([]);
  const [selectedFund, setSelectedFund] = useState<any>([]);
  const [selectedFolio, setSelectedFolio] = useState<any>([]);
  const [includeBalanceUnits, setIncludeBalanceUnits] = useState(true);
  const [includePurchaseNAV, setIncludePurchaseNAV] = useState(true);
  const [includeCurrentNAV, setIncludeCurrentNAV] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isBetaVerson, setIsBetaVerson] = useState(true);

  //  dropdowns Data
  const investorOptions = [
    { value: 1, label: "All Investors" },
    { value: 2, label: "Khusboo Singh" },
    { value: 3, label: "Ojas Singh" },
    { value: 4, label: "Subesh Kumar " },
  ];

  const sourceOptions = [
    { value: "all", label: "All" },
    { value: "managed", label: "Managed Data" },
    { value: "outside", label: "Outside Data" },
    { value: "internal", label: "Internal Data" },
    { value: "api", label: "API Data" },
  ];
  const groupByOptions = [
    { value: "InvestorCategoryFolio", label: "Investor, Category, Folio" },
    {
      value: "InvestorCategoryFolioTransaction",
      label: " Investor, Category, Folio, Transaction",
    },
    { value: "InvestorCategory", label: " Investor, Category" },
    { value: "SubCategoryFolio", label: "Investor, Sub Category, Folio" },
    { value: "Sub Category", label: "Investor, Sub Category" },
    { value: "transaction", label: "Investor, Transaction" },
    { value: "category", label: "Category" },
  ];

  const holdingPeriodOptions = [
    { value: "all", label: "All" },

    { value: "<1year", label: "Upto 1 year" },
    { value: "1year", label: "More than 1 year" },
    { value: "2year", label: "More than 2 year" },
    { value: "3year", label: "More than 3 year" },
    { value: "4year", label: "More than 4 year" },
    { value: "5year", label: "More than 5 year" },
  ];

  const transactionTypeOptions = [
    { value: 1, label: "All" },
    { value: 2, label: "Redemption" },
    { value: 3, label: "PurchaseSIPSTISwitch" },
    { value: 4, label: "InDividend" },
    { value: 5, label: "ReinvestBonus" },
  ];

  const categoryOptions = [
    { value: 1, label: "Equity" },
    { value: 2, label: "Debt" },
    { value: 3, label: "Hybrid" },
    { value: 4, label: "Solution Oriented" },
  ];

  const subCategoryOptions = [
    { value: 1, label: "Large Cap" },
    { value: 2, label: "Mid Cap" },
    { value: 3, label: "Small Cap" },
    { value: 4, label: "Multi Cap" },
  ];

  const fundOptions = [
    { value: 1, label: "HDFC Top 100 Fund" },
    { value: 2, label: "ICICI Prudential Bluechip Fund" },
    { value: 3, label: "SBI Large Cap Fund" },
    { value: 4, label: "Axis Bluechip Fund" },
  ];

  const folioOptions = [
    { value: 1, label: "Nippon India Liquid Fund (G) / 477726204955" },
    { value: 2, label: "HDFC Liquid Fund (G) / 123456789012" },
    { value: 3, label: "ICICI Liquid Fund (G) / 987654321098" },
  ];

  useEffect(() => {
    const savedFilters = localStorage.getItem("reportsFilters");
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setViewType(parsedFilters.viewType || "On Screen");
      setSelectedAssetClass(parsedFilters.selectedProduct || "Mutual Fund");
      setSelectedData(parsedFilters.selectedData || "Investment snapshot");
      setSelectedAllocations(parsedFilters.selectedAllocations || "Investor");
      setSelectedGroup(parsedFilters.selectedGroup || "Folio");
      setMfAllocations(parsedFilters.mfAllocation || "Fund");
      setReportType(parsedFilters.reportType || "Category");
      setEmailViewType(
        parsedFilters.emailViewType || "CC Relationship Manager"
      );

      setSelectedInvestor(parsedFilters.selectedInvestor || []);
      setSelectedSource(parsedFilters.selectedSource || []);
      setReportDate(parsedFilters.reportDate || "23-06-2025");
      setSelectedHoldingPeriod(parsedFilters.selectedHoldingPeriod || []);
      setSelectedTransactionType(parsedFilters.selectedTransactionType || []);
      setSelectedCategory(parsedFilters.selectedCategory || []);
      setSelectedSubCategory(parsedFilters.selectedSubCategory || []);
      setIsBetaVerson(parsedFilters.isBetaVerson ?? true);
      setSelectedFund(parsedFilters.selectedFund || []);
      setSelectedFolio(parsedFilters.selectedFolio || []);
      setIncludeBalanceUnits(parsedFilters.includeBalanceUnits ?? true);
      setIncludePurchaseNAV(parsedFilters.includePurchaseNAV ?? true);
      setIncludeCurrentNAV(parsedFilters.includeCurrentNAV ?? true);
    }
  }, []);

  const resetFilter = (e: any) => {
    setViewType("On Screen");
    setSelectedAssetClass("Mutual Fund");
    setSelectedAllocations("Mutual Fund");
    setSelectedGroup("Folio");
    setMfAllocations("Fund");
    setReportType("Category");
    setEmailViewType("CC Relationship Manager");
    setSelectedInvestor([]);
    setSelectedSource([]);
    setReportDate("23-06-2025");
    setSelectedHoldingPeriod([]);
    setSelectedTransactionType([]);
    setSelectedCategory([]);
    setSelectedSubCategory([]);
    setSelectedFund([]);
    setSelectedFolio([]);
    setIsBetaVerson(true);
    setIncludeBalanceUnits(true);
    setIncludePurchaseNAV(true);
    setIncludeCurrentNAV(true);
    localStorage.removeItem("reportsFilters");
    setPayload(false);
    handleClose(e);
  };

  const applyFilter = (e: any) => {
    const obj: any = {
      viewType,
      selectedAssetClass,
      selectedInvestor,
      selectedData,
      selectedSource,
      reportDate,
      selectedHoldingPeriod,
      selectedTransactionType,
      selectedCategory,
      selectedSubCategory,
      selectedFund,
      selectedFolio,
      includeBalanceUnits,
      includePurchaseNAV,
      includeCurrentNAV,
    };

    localStorage.setItem("reportsFilters", JSON.stringify(obj));
    setPayload(obj);
    handleClose(e);
  };

  if (!isOpen) return null;

  function setValue(arg0: string, value: any) {
    throw new Error("Function not implemented.");
  }

  function clearErrors(arg0: string) {
    throw new Error("Function not implemented.");
  }

  function data(value: string, index: number, array: string[]): unknown {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className="flex justify-between items-center ">
        <CustomLabel className="text-lg font-medium font-montserrat pl-2">
          Filter
        </CustomLabel>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>
      <div className="mt-2 h-[1px] w-full bg-accent"></div>
      <div className="overflow-y-auto  p-4">
        {/* View Type Section */}
        <div className="mb-6">
          <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
            View Type:
          </CustomLabel>
          <div className="grid grid-cols-2 pl-3 gap-3">
            {["On Screen", "PDF", "Excel", "Excel (Unformatted)", "Email"].map(
              (type) => (
                <div key={type}>
                  <CustomRadio
                    label={type}
                    className="radio-xs radio-secondary"
                    checked={viewType === type}
                    onChange={() => setViewType(type)}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Group By Type Section */}
        {viewType !== "On Screen" && <hr className="text-accent my-6" />}

        {viewType === "On Screen" && (
          <>
            <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
              Group By:
            </CustomLabel>
            <div className="grid grid-cols-2 pl-3  justify-around gap-3">
              {["Folio", "Scheme", "Investor", "Category"].map((product) => (
                <div key={product}>
                  <CustomRadio
                    label={product}
                    className="radio-xs radio-secondary"
                    checked={selectedGroup === product}
                    onChange={() => setSelectedGroup(product)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Choose Product Section */}
        {viewType === "PDF" && (
          <>
            <div className="mb-3">
              <CustomCheckbox
                label={"Beta Version"}
                checked={isBetaVerson}
                onChange={() => setIsBetaVerson((prev: boolean) => !prev)}
              />
            </div>
            {isBetaVerson && (
              <div className="grid grid-cols-2 pl-3  justify-around gap-3">
                {["Category", "Sub-Category"].map((product) => (
                  <div key={product}>
                    <CustomRadio
                      label={product}
                      className="radio-xs radio-secondary"
                      checked={selectedGroup === product}
                      onChange={() => setSelectedGroup(product)}
                    />
                  </div>
                ))}
              </div>
            )}
            <hr className="text-accent my-6" />
          </>
        )}
        {(viewType === "PDF" ||
          viewType === "Excel" ||
          viewType === "Excel (Unformatted)" ||
          viewType === "Email") && (
          <>
            <div className="mb-6">
              <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
                Assets Class:
              </CustomLabel>
              <div className="flex flex-wrap justify-between gap-3 px-2 ">
                {[
                  "Mutual Fund",
                  "Share & Bond",
                  "Fixed Deposit",
                  "Other Assets",
                ].map((product) => (
                  <div key={product}>
                    <CustomCheckbox
                      label={product}
                      className=""
                      // checked={product}
                      onChange={() => product}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {/* {viewType === "PDF" && (
          <>
            <CustomLabel>Group By :</CustomLabel>
            <CustomSelect
              items={groupByOptions}
              bindName="label"
              bindValue="label"
              onChange={(e) => {
                setValue("label", e?.target.value);
              }}
              className="w-full border-accent text-accent"
            />
          </>
        )} */}

        {viewType === "Email" && (
          <>
            <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
              Report Type:
            </CustomLabel>

            <>
              <div className="flex flex-wrap justify-between gap-3 px-2 my-3">
                <CustomCheckbox
                  label="CC With Relationship Manager"
                  className=""
                  checked={emailViewType === "CC Relationship Manager"}
                  onChange={() =>
                    setEmailViewType((prev) =>
                      prev === "CC Relationship Manager"
                        ? ""
                        : "CC Relationship Manager"
                    )
                  }
                />
              </div>

              <div className="mb-3 pl-2">
                <CustomCheckbox
                  label={"Beta Version"}
                  checked={isBetaVerson}
                  onChange={() => setIsBetaVerson((prev: boolean) => !prev)}
                />
              </div>
            </>

            <div className="grid grid-cols-2 pl-3  justify-around gap-3">
              {["Category", "Sub-Category", "Transaction", "Client Wise"].map(
                (product) => (
                  <div key={product}>
                    <CustomRadio
                      label={product}
                      className="radio-xs radio-secondary"
                      checked={reportType === product}
                      onChange={() => setReportType(product)}
                    />
                  </div>
                )
              )}
            </div>
          </>
        )}

        {viewType !== "Excel (Unformatted)" && (
          <hr className="text-accent my-6" />
        )}

        {/* Filter Section */}
        <div className="mb-6">
          <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
            Filter:
          </CustomLabel>

          <div className="flex  flex-col gap-2 mb-4">
            {/* Investor */}
            <div className="w-full">
              <CustomLabel className="block text-sm font-medium mb-2">
                Investor:
              </CustomLabel>
              <MultiSelect
                options={investorOptions}
                value={investorOptions.filter((item: any) =>
                  selectedInvestor?.includes(item.value)
                )}
                onChange={(selected: any) =>
                  setSelectedInvestor(selected.map((item: any) => item.value))
                }
                labelledBy="Select Investor"
                hasSelectAll={false}
                overrideStrings={{ selectSomeItems: "All Investors" }}
                className="multi-select-up "
                ClearIcon={null}
                ItemRenderer={({ checked, option, onClick }: any) => (
                  <div
                    onClick={onClick}
                    className="flex items-center gap-2 px-2 cursor-pointer active:!text-black"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onClick}
                      className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                    />
                    <span className="hover:text-black">{option.label}</span>
                  </div>
                )}
              />
            </div>

            {/* Source */}
            <div className="w-full">
              {/* <CustomLabel className="block text-sm font-medium mb-2">
                Source:
              </CustomLabel>
              <MultiSelect
                options={sourceOptions}
                value={sourceOptions.filter((item: any) =>
                  selectedSource?.includes(item.value)
                )}
                onChange={(selected: any) =>
                  setSelectedSource(selected.map((item: any) => item.value))
                }
                labelledBy="Select Source"
                hasSelectAll={false}
                overrideStrings={{ selectSomeItems: "All" }}
                className="multi-select-up"
                ClearIcon={null}
                ItemRenderer={({ checked, option, onClick }: any) => (
                  <div
                    onClick={onClick}
                    className="flex items-center gap-2 px-2 cursor-pointer active:!text-black"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onClick}
                      className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                    />
                    <span className="hover:text-black">{option.label}</span>
                  </div>
                )}
              /> */}
              <CustomLabel>Source :</CustomLabel>
              <CustomSelect
                items={sourceOptions}
                bindName="label"
                bindValue="label"
                onChange={(e) => {
                  setValue("label", e?.target.value);
                }}
                className="w-full border-accent text-accent"
              />
            </div>
          </div>

          <div className="flex flex-col  gap-4 mb-4">
            {/* Report Date */}
            <div className="w-full">
              <CustomLabel className="block text-sm font-medium mb-1">
                Date Range:
              </CustomLabel>
              <div className="flex items-center gap-3">
                <CustomInput
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className=" w-full input-md rounded-xl mt-0"
                />
                <CustomText>-</CustomText>
                <CustomInput
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className=" w-full input-md rounded-xl mt-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="my-4 h-[1px] w-full bg-accent"></div> */}
        {/* <hr className="text-accent mb-4" /> */}

        {/* Advanced Filters Section */}
        <div className="mb-6">
          <CustomButton
            className="flex items-center btn-sm gap-2 font-semibold font-montserrat mb-4"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            Advanced Filters
            {showAdvanced ? (
              <FaChevronUp className=" transition-all" />
            ) : (
              <FaChevronUp className="rotate-180 transition-all" />
            )}
          </CustomButton>

          {showAdvanced && (
            <>
              {/* Category */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Category:
                </label>
                <MultiSelect
                  options={categoryOptions}
                  value={categoryOptions.filter((item: any) =>
                    selectedCategory?.includes(item.value)
                  )}
                  onChange={(selected: any) =>
                    setSelectedCategory(selected.map((item: any) => item.value))
                  }
                  labelledBy="Select Category"
                  hasSelectAll={false}
                  overrideStrings={{ selectSomeItems: "All Selected" }}
                  className="multi-select-up"
                  ClearIcon={null}
                  ItemRenderer={({ checked, option, onClick }: any) => (
                    <div
                      onClick={onClick}
                      className="flex  items-center gap-2 px-2 cursor-pointer active:!text-black"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={onClick}
                        className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                      />
                      <span className="hover:text-black">{option.label}</span>
                    </div>
                  )}
                />
              </div>

              {/* Sub Category */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Sub Category:
                </label>
                <MultiSelect
                  options={subCategoryOptions}
                  value={subCategoryOptions.filter((item: any) =>
                    selectedSubCategory?.includes(item.value)
                  )}
                  onChange={(selected: any) =>
                    setSelectedSubCategory(
                      selected.map((item: any) => item.value)
                    )
                  }
                  labelledBy="Select Sub Category"
                  hasSelectAll={false}
                  overrideStrings={{ selectSomeItems: "Select Sub Category" }}
                  className="multi-select-up"
                  ClearIcon={null}
                  ItemRenderer={({ checked, option, onClick }: any) => (
                    <div
                      onClick={onClick}
                      className="flex items-center gap-2 px-2 cursor-pointer active:!text-black"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={onClick}
                        className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                      />
                      <span className="hover:text-black">{option.label}</span>
                    </div>
                  )}
                />
              </div>

              {/* Fund */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">Fund:</label>
                <MultiSelect
                  options={fundOptions}
                  value={fundOptions.filter((item: any) =>
                    selectedFund?.includes(item.value)
                  )}
                  onChange={(selected: any) =>
                    setSelectedFund(selected.map((item: any) => item.value))
                  }
                  labelledBy="Select Fund"
                  hasSelectAll={false}
                  overrideStrings={{ selectSomeItems: "All Selected" }}
                  className="multi-select-up"
                  ClearIcon={null}
                  ItemRenderer={({ checked, option, onClick }: any) => (
                    <div
                      onClick={onClick}
                      className="flex items-center gap-2 px-2 cursor-pointer active:!text-black"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={onClick}
                        className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                      />
                      <span className="hover:text-black">{option.label}</span>
                    </div>
                  )}
                />
              </div>

              {/* Folio */}
              <div>
                <label className="block text-sm font-medium mb-2">Folio:</label>
                <MultiSelect
                  options={folioOptions}
                  value={folioOptions.filter((item: any) =>
                    selectedFolio?.includes(item.value)
                  )}
                  onChange={(selected: any) =>
                    setSelectedFolio(selected.map((item: any) => item.value))
                  }
                  labelledBy="Select Folio"
                  hasSelectAll={false}
                  overrideStrings={{ selectSomeItems: "Type to Search..." }}
                  className="multi-select-up"
                  ClearIcon={null}
                  ItemRenderer={({ checked, option, onClick }: any) => (
                    <div
                      onClick={onClick}
                      className="flex items-center gap-2 px-2 cursor-pointer active:!text-black"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={onClick}
                        className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                      />
                      <span className="hover:text-black">{option.label}</span>
                    </div>
                  )}
                />
              </div>
            </>
          )}
        </div>

        {viewType !== "Excel (Unformatted)" && (
          <hr className="text-accent my-6" />
        )}
        <div className="mb-6">
          <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
            Data Options :
          </CustomLabel>
          {(viewType === "On Screen" ||
            viewType === "Excel" ||
            viewType === "Excel (Unformatted)") && (
            <>
              <div className="grid grid-cols-2 justify-between gap-y-3 gap-x-5 pl-3 ">
                {[" Active Assets only"].map((data: any) => (
                  <div key={data}>
                    <CustomCheckbox
                      label={data}
                      onChange={() => setSelectedData(data)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          {(viewType === "PDF" || viewType === "Email") && (
            <>
              <div className="grid grid-cols-2 justify-between gap-y-3 gap-x-5 pl-2 mb-6">
                {[
                  "Mutual Fund",
                  "Share & Bond",
                  "Fixed Deposit",
                  "Other Assets",
                ].map((data) => (
                  <div key={data}>
                    <CustomCheckbox
                      label={data}
                      checked={selectedData === data}
                      onChange={() => setSelectedData(data)}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
                  Allocation Sections:
                </CustomLabel>
                <div className="grid grid-cols-2 justify-between gap-y-3 gap-x-5 pl-2 ">
                  {["Investor", "Fund", "Scheme", "MF Equity Market Cap"].map(
                    (data) => (
                      <div key={data}>
                        <CustomCheckbox
                          label={data}
                          checked={selectedData === data}
                          onChange={() => setSelectedData(data)}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Columns Include Section */}
        {viewType !== "Excel (Unformatted)" && (
          <>
            <div className="mb-3">
              <CustomLabel className="text-lg font-semibold  font-montserrat">
                Columns Include:
              </CustomLabel>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3 px-3">
          {(viewType === "On Screen" || viewType === "Email") && (
            <>
              {[
                "Switch In",
                "Switch Out",
                "Dividend Payout",
                "Dividend Reinvest",
                "Balance Units",
                "Purchase Outstanding",
                "Absolute return",
                "Unrealized Gain",
                "Realized Gain",
                "XIRR",
              ].map((data) => (
                <div key={data}>
                  <CustomCheckbox label={data} onChange={() => data} />
                </div>
              ))}
            </>
          )}

          {(viewType === "PDF" || viewType === "Excel") && (
            <>
              {[
                "Switch In",
                "Switch Out",
                "Dividend Payout",
                "Dividend Reinvest",
                "Purchase Outstanding",
                "Absolute return",
                "Unrealized Gain",
                "Realized Gain",
                "XIRR",
              ].map((data) => (
                <div key={data}>
                  <CustomCheckbox label={data} onChange={() => data} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* <div className="mb-2 h-[1px] w-full bg-accent"></div> */}
      {viewType !== "Excel (Unformatted)" && (
        <hr className="text-accent my-6" />
      )}

      {/* Footer */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-4">
          <button
            className="btn btn-outline w-full rounded-lg border-border"
            onClick={resetFilter}
          >
            Reset
          </button>
          <button
            className="btn bg-primary hover:bg-primary text-white border-none w-full rounded-lg"
            onClick={(e) => applyFilter(e)}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default PortfolioSummary;
