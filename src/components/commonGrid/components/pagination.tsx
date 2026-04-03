"use client";

import { DefaultItemsPerPage } from "@/utils/constants";
import React, { useEffect, useMemo, useState } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import ReactPaginate from "react-paginate";
import styles from "../DataGrid.module.scss";
import CustomButton from "@/commonUI/Button";

interface PaginationProps {
  totalCount: number;
  limit: number;
  onPageChange: (page: any) => void;
  page: number;
}

const Pagination = ({
  totalCount,
  limit,
  onPageChange,
  page,
  ...props
}: PaginationProps) => {

  const [currentPage, setCurrentPage] = useState(page);

  const [isMobileView, setIsMobileView] = useState<any>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // or 640
    };

    handleResize(); // set on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageCount = useMemo(() => {
    const l = limit || DefaultItemsPerPage;
    const t = totalCount || 0;
    const count = Math.ceil(t / l) || 0;
    return count;
  }, [limit, totalCount]);

  const handlePageChange = (e: { selected: number }) => {
    const selectedPage = e.selected + 1;
    setCurrentPage(selectedPage);
    onPageChange(selectedPage);
  };

  const getPaginatedData = (total: number, pageSize: number, page: number) => {
    if (total == 0) {
      return 0;
    }
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(page * pageSize, total);
    return `${startIndex + 1} - ${endIndex}`;
  };

  const handleInputPageChange = (event: any) => {

    console.log(event, "eventevent")
    let value = parseInt(event.target.value);
    if (isNaN(value)) return;

    // Keep in range
    if (value < 1) value = 1;
    if (value > pageCount) value = pageCount;

    setCurrentPage(value);
    onPageChange(value); // ✅ Call your parent logic too
  }

  useEffect(() => {
    if (totalCount === 0) {
      setCurrentPage(1);
    } else if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    } else {
      setCurrentPage(1);
    }
  }, [totalCount, pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  return totalCount > 0 ? (
    <div
      className={`${styles.paginationContainer} sm:flex xl:flex-row 2xl:flex-row md:flex-row justify-between place-items-center px-3 pb-3 gap-1`}
    >
      <div className="pagination-info text-xs border-0 w-fit p-2 rounded-lg bg-border/30 whitespace-nowrap mb-3 sm:mb-0">
        <div>
          Showing{" "}
          <span className="px-1 py-1 font-semibold">
            {getPaginatedData(totalCount, limit, currentPage)}
          </span>
          &nbsp;of&nbsp;
          <span className="px-1 font-semibold">{totalCount}</span> items
        </div>
      </div>

      <div className="w-full sm:w-auto lg:w-auto xl:w-auto 2xl:w-auto overflow-x-auto flex gap-4 items-center">
        {/* <div className="input w-28 focus-within:outline-0 rounded-lg">
          <input
            className={`grow autofill:!bg-white disabled:text-black shadow-[inset_1000px_0px_0px_rgba(255,255,255,1)] disabled:shadow-[inset_1000px_0px_0px_#f8f8f8] `}
            type="number"
            value={currentPage}
            onChange={(e: any) => handleInputPageChange(e)}
          />
        </div> */}
        <div className="inline-flex gap-1 whitespace-nowrap lg:justify-end w-full md:justify-start">
          <ReactPaginate
            breakLabel="..."
            containerClassName={`${styles.pagination} flex gap-1`}
            nextLabel={
              <CustomButton className="text-skin-base p-0 w-10 bg-white shadow-none">
                <GrNext className="text-black" />
              </CustomButton>
            }
            onPageChange={handlePageChange}
            // pageRangeDisplayed={1}
            // marginPagesDisplayed={2}
            pageRangeDisplayed={isMobileView ? 0 : 1} // no middle pages on mobile
            marginPagesDisplayed={isMobileView ? 1 : 2} // only show start and end
            pageCount={pageCount}
            pageLinkClassName={"pageLink"}
            // activeLinkClassName={"activePage"}
            forcePage={currentPage - 1}
            activeClassName={styles.active}
            previousLabel={
              <CustomButton className="text-skin-base p-0 w-10 bg-white shadow-none">
                <GrPrevious className="text-black" />
              </CustomButton>
            }
            renderOnZeroPageCount={null}
            {...props}
          />
        </div>
      </div>
    </div>
  ) : null;
};

export default Pagination;
