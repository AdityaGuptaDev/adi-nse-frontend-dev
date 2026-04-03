"use client";
import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/rm-list/index"));

function UserList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("RM List");
  }, [setTitle]);

  return <Page {...props} />;
}

// export default UserList
export default WithAuth(UserList);
