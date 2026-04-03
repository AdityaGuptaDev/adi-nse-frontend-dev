"use client";
import React, { useContext, useEffect, useState } from "react";
import { getActionPermission, getLS } from "@/utils/helpers";
import AuthContext from "@/context/auth/AuthContext";
import { usePathname } from 'next/navigation'
import { USER_DATA } from "@/utils/constants";

function WithAuth(Comp: any) {
  return function WrappedWithToast(props: any) {
    const { authState }: any = useContext(AuthContext);
    // const router = useRouter();
    const pathname = usePathname()

    const [permission, setpermission] = useState({});
    const [userData, setUserData] = useState({});

    useEffect(() => {
      // if (!authState?.authenticated) {
      //   router.replace({pathname:"/Login"});
      // }

      const permOBJ = getActionPermission(pathname);
      const user: any = getLS(USER_DATA);

      // if (!permOBJ && !permOBJ?.length) {
      // router.push("/Login");
      // }

      setpermission(permOBJ);
      setUserData(user);
    }, []);

    return <Comp {...{ ...props, permission: permission, user: userData }} />;
  };
}

export default WithAuth;
