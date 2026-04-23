"use client";

import CustomText from "@/commonUI/Text";
import Pagination from "@/components/commonGrid/components/pagination";
import api from "@/utils/api";
import { toFixedDataForReturn } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";

function Holdings({ schemeData }: any) {
  const [holdingData, setHoldingData] = useState<any[]>([]);
  const [holdingViewAllPage, setHoldingViewAllPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (schemeData) getHoldingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeData, page]);

  const getHoldingData = async () => {
    setLoading(true);
    try {
      const param = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN,
        filters: false,
        limit,
        page,
      };

      const res: any = await api.get(`/scheme/get-mutual-holdingData`, { params: param });
      if (res.data.data) {
        setHoldingData(res.data.data.rows ?? []);
        setTotalCount(res.data.data.count ?? 0);
      }
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllHolding = () => setHoldingViewAllPage(true);
  const onPageChange = (p: number) => setPage(p);
  const onBack = () => {
    setHoldingViewAllPage(false);
    setPage(1);
  };

  const rowsToShow = holdingViewAllPage ? holdingData : holdingData.slice(0, 10);

  return (
    <div className="p-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          {holdingViewAllPage ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="cursor-pointer text-base-content/70 hover:text-primary transition-colors"
                aria-label="Back"
              >
                <IoMdArrowRoundBack size={22} />
              </button>
              <div>
                <CustomText className="text-sm font-semibold text-base-content">
                  All Holdings
                </CustomText>
                <div className="text-xs text-base-content/50 mt-0.5">
                  {totalCount} {totalCount === 1 ? "instrument" : "instruments"}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <CustomText className="text-sm font-semibold text-base-content">
                  Top Holdings
                </CustomText>
                <div className="text-xs text-base-content/50 mt-0.5">
                  Portfolio allocation by weight
                </div>
              </div>
              {totalCount > 10 && (
                <button
                  onClick={handleViewAllHolding}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View All
                </button>
              )}
            </>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          </div>
        )}

        {/* Empty */}
        {!loading && rowsToShow.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-sm text-base-content/50">
              No holdings data available.
            </div>
          </div>
        )}

        {/* Rows */}
        {!loading && rowsToShow.length > 0 && (
          <div
            className={`divide-y divide-white/5 ${
              holdingViewAllPage
                ? "overflow-auto h-[calc(100vh-310px)] 2xl:h-[calc(100vh-380px)]"
                : ""
            }`}
          >
            {rowsToShow.map((item: any, index: number) => {
              const weight = Number(item?.portfolio_weighting ?? 0);
              const clamped = Math.max(0, Math.min(100, weight));
              return (
                <div
                  key={item?.id ?? index}
                  className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="min-w-0 flex-1">
                      <CustomText className="text-sm font-medium text-base-content truncate">
                        {item?.name || "--"}
                      </CustomText>
                      <CustomText className="text-xs text-base-content/50 mt-0.5">
                        {item?.sector || "Sector N/A"}
                      </CustomText>
                    </div>

                    <div className="flex items-center gap-3 min-w-fit">
                      <div className="w-32 sm:w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-[#FBBF24] rounded-full transition-all"
                          style={{ width: `${clamped}%` }}
                        />
                      </div>
                      <CustomText className="text-sm font-semibold text-base-content tabular-nums min-w-[60px] text-right">
                        {toFixedDataForReturn(weight)}
                      </CustomText>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {holdingViewAllPage && !loading && totalCount > 0 && (
          <div className="px-6 py-4 border-t border-white/5">
            <Pagination
              totalCount={totalCount}
              limit={limit}
              page={page}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Holdings;
