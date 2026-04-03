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

const AssetLocationFiler = ({ isOpen, handleClose, setPayload }: any) => {
  const [viewType, setViewType] = useState("On Screen");
  const [selectedProduct, setSelectedProduct] = useState("Mutual Fund");
  const [selectedData, setSelectedData] = useState("Investment snapshot");
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

  useEffect(() => {
    const savedFilters = localStorage.getItem("reportsFilters");
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setViewType(parsedFilters.viewType || "On Screen");
      setSelectedProduct(parsedFilters.selectedProduct || "Mutual Fund");
      setSelectedData(parsedFilters.selectedData || "Investment snapshot");
      setMfAllocations(parsedFilters.mfAllocation || "Fund");
      setReportType(parsedFilters.reportType || "Category");
      setEmailViewType(
        parsedFilters.emailViewType || "CC Relationship Manager"
      );

      setSelectedInvestor(parsedFilters.selectedInvestor || []);
      setSelectedSource(parsedFilters.selectedSource || []);
    }
  }, []);

  const resetFilter = (e: any) => {
    setViewType("On Screen");
    setSelectedProduct("Mutual Fund");
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
      selectedProduct,
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
        {/* Choose Product Section */}
        <div className="w-full mb-6">
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
            // className="multi-select-up "
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
        <div className="w-full mb-6">
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
        <div className="mb-6">
          <CustomLabel className="text-lg font-semibold mb-3 font-montserrat">
            Choose Product:
          </CustomLabel>
          <div className="flex flex-wrap  justify-between px-3 gap-3">
            {[
              "Mutual Fund",
              "Share & Bond",
              "Fixed Deposit",
              "Other Assets",
            ].map((product) => (
              <div key={product}>
                <CustomRadio
                  label={product}
                  className="radio-xs radio-secondary"
                  checked={selectedProduct === product}
                  onChange={() => setSelectedProduct(product)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetLocationFiler;
