import React, { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

interface Asset {
  assetName: string;
  unitQuantity?: string;
  marketValue?: string;
  weightage?: string;
}

interface Section {
  title: string;
  assets: Asset[];
  isExpandable: boolean;
}

const portfolioSections: Section[] = [
  {
    title: "Corporate Debt",
    isExpandable: true,
    assets: [
      {
        assetName: "Bharti Telecom Ltd. -SR-XVII 8.95% (04-Dec-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Bharti Telecom Ltd. -SR-XIII 8.70% (05-Dec-25)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName:
          "Cholamandalam Investment & Finance Co. Ltd. 07.5% (30-Sep-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Bharti Telecom Ltd. -SR-XIX 8.65% (05-Nov-27)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Yes Bank Ltd. 08.00% (30-Sep-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "360 One Prime Ltd. - 09.30% (28-Feb-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Samvardhana Motherson International Ltd. 06.5% (20-Sep-27)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
    ],
  },
  {
    title: "Government Securities",
    isExpandable: true,
    assets: [],
  },
  {
    title: "Cash & Cash Equivalents and Net Assets",
    isExpandable: true,
    assets: [
      {
        assetName: "Bharti Telecom Ltd. -SR-XVII 8.95% (04-Dec-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Bharti Telecom Ltd. -SR-XIII 8.70% (05-Dec-25)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName:
          "Cholamandalam Investment & Finance Co. Ltd. 07.5% (30-Sep-26)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
      {
        assetName: "Bharti Telecom Ltd. -SR-XIX 8.65% (05-Nov-27)",
        unitQuantity: "32,000",
        marketValue: "324.67",
        weightage: "0.5%",
      },
    ],
  },
  {
    title: "Treasury Bills",
    isExpandable: true,
    assets: [],
  },
  {
    title: "PTC & Securitized Debt",
    isExpandable: true,
    assets: [],
  },
  {
    title: "Certificate of Deposit",
    isExpandable: true,
    assets: [],
  },
  {
    title: "Commercial Paper",
    isExpandable: true,
    assets: [],
  },
  {
    title: "Rights",
    isExpandable: true,
    assets: [],
  },
  {
    title: "Derivatives-Call Options",
    isExpandable: true,
    assets: [],
  },
];

export default function OtherAssets() {
  const [expandedSections, setExpandedSections] = useState({
    "Corporate Debt": true,
  });

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-accent">
          <th className="text-left text-sm py-3 px-2 font-medium w-1/2 text-black">
            Asset Name
          </th>
          <th className="text-right text-sm py-3 px-2 font-medium text-black">
            Unit Quantity
          </th>
          <th className="text-right text-sm py-3 px-2 font-medium text-black">
            Market Value Rs. (Cr.)
          </th>
          <th className="text-right text-sm py-3 px-2 font-medium text-black">
            Weightage
          </th>
        </tr>
      </thead>
      <tbody>
        {portfolioSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {/* Section Header */}
            <tr className="bg-accent-content border-b border-accent w-full">
              <td
                className="py-3 px-2 text-sm font-medium text-base-content cursor-pointer "
                onClick={() => toggleSection(section.title)}
                colSpan={4}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{section.title}</span>
                  {section.isExpandable && (
                    <span className="text-primary">
                      {expandedSections[section.title] ? (
                        <FaChevronUp className="w-3 h-4 transition-transform " />
                      ) : (
                        <FaChevronUp className="w-3 h-4 rotate-180 transition-transform" />
                      )}
                    </span>
                  )}
                </div>
              </td>
            </tr>

            {/* Section Assets */}
            {expandedSections[section.title] &&
              section.assets.map((asset, assetIndex) => (
                <tr
                  key={`${section.title}-${assetIndex}`}
                  className="bg-[#111111]  border-b border-accent "
                >
                  <td className="py-3 px-2 text-sm text-base-content ">
                    {asset.assetName}
                  </td>
                  <td className="py-3 pr-8 text-sm text-right text-black">
                    {asset.unitQuantity || ""}
                  </td>
                  <td className="py-3 pr-10   text-sm text-right text-black">
                    {asset.marketValue || ""}
                  </td>
                  <td className="py-3 pr-8 text-sm text-right text-black">
                    {asset.weightage || ""}
                  </td>
                </tr>
              ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
