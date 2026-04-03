"use client";
import CustomButton from "@/commonUI/Button";
import CustomCheckBox from "@/commonUI/CheckBox";
import CustomBackButton from "@/commonUI/CustomBackButton";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function Permission() {
  const [roleId, setRoleId] = useState<any>();
  const [roleList, setRoleList] = useState<any>([]);
  const [menuList, setMenuList] = useState<any>([]);
  const [finalObj, setFinalObj] = useState<any>({});
  const [All, setAll] = useState({
    viewAll: false,
    addAll: false,
    editAll: false,
    deleteAll: false,
    exportAll: false,
    multiActionAll: false,
    disabled: false,
  });
  const [TotalCount, setTotalCount] = useState(0);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    getRoleList();
  }, []);

  const getRoleList = async () => {
    try {
      let role = await api.get(`role/getAllActiveRole`);
      setRoleList(role.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const changeRole = async (event: any) => {
    console.log(event,"eventeventevent")
    const roleId = event ? event.id : null;
    setRoleId(roleId);
    if (!roleId) {
      setRoleId(null);
      return;
    }

    const permissions = event?.permission || null;
    const parsedPermissions = permissions ? JSON.parse(permissions) : null;

    setFinalObj(parsedPermissions);

    if (parsedPermissions) {
      const allPermissions = {
        viewAll: parsedPermissions["viewAll"] ?? false,
        addAll: parsedPermissions["addAll"] ?? false,
        editAll: parsedPermissions["editAll"] ?? false,
        deleteAll: parsedPermissions["deleteAll"] ?? false,
        exportAll: parsedPermissions["exportAll"] ?? false,
        multiActionAll: parsedPermissions["multiActionAll"] ?? false,
        disabled:
          parsedPermissions["addAll"] &&
          parsedPermissions["editAll"] &&
          parsedPermissions["deleteAll"] &&
          parsedPermissions["exportAll"] &&
          parsedPermissions["multiActionAll"]
            ? true
            : false,
      };
      setAll(allPermissions);
    }

    try {
      const response = await api.get(`permission/getMenuPermissionList`, {
        params: { id: roleId },
      });

      setMenuList(response.data.data);
      getCheckAll(response.data.data);
    } catch (error) {
      handleServerError(error);
      // toast.error(`${error.response?.data?.msg || 'An error occurred'} - custom`);
    }
  };

  const getCheckAll = (menu: any[]) => {
    return menu.filter((item) => {
      if (item?.children?.length === 0) {
        setTotalCount((prev) => prev + 1);
        const singlePerm = item?.permission;

        if (!singlePerm?.["view"]) {
          setFinalObj((prevFinalObj: any) => ({
            ...prevFinalObj,
            viewAll: false,
            addAll: false,
            editAll: false,
            deleteAll: false,
            exportAll: false,
            multiActionAll: false,
          }));
        }
        return true;
      } else if (item?.children?.length > 0) {
        item.children = getCheckAll(item.children);
        return item.children.length > 0;
      } else {
        return false;
      }
    });
  };

  const checkboxClicked = (event: any, item: any, name: string) => {
    const value = event.target.checked;

    setMenuPermission(menuList, item, value, name);

    // Optionally handle some conditions here if necessary
  };

  const setMenuPermission = (
    menu: any[],
    obj: any,
    value: boolean,
    name: string
  ) => {
    return menu.map((item) => {
      let basePerm: any = {
        view: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        multiAction: false,
        disabled: false,
      };

      if (item.children?.length === 0) {
        basePerm = item?.permission ? item.permission : basePerm;

        if (item.id === obj.id) {
          const singlePerm = { ...basePerm, [name]: value };
          const check =
            singlePerm.add ||
            singlePerm.edit ||
            singlePerm.delete ||
            singlePerm.export ||
            singlePerm.multiAction
              ? true
              : false;
          item.permission = {
            ...singlePerm,
            view: singlePerm.view,
            disabled: check,
          };

          setFinalObj((prevFinalObj: any) => ({
            ...prevFinalObj,
            [item.id]: {
              ...prevFinalObj[item.id],
              [name]: value,
              view: singlePerm.view,
              disabled: check,
            },
          }));
        } else {
          item.permission = basePerm;
        }
      } else if (item.children?.length > 0) {
        item.children = setMenuPermission(item.children, obj, value, name);
      }
      return item;
    });
  };

  const allCheckboxClicked = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const value = event.target.checked;
    const setAllValue = { ...All, [`${name}All`]: value };
    setAll(setAllValue);
    let check =
      setAllValue.addAll ||
      setAllValue.editAll ||
      setAllValue.deleteAll ||
      setAllValue.exportAll ||
      setAllValue.multiActionAll
        ? true
        : false;

    setAll({ ...setAllValue, disabled: check });
    setFinalObj({ ...finalObj, ...setAllValue });
    setMenuPermissionAll(menuList, value, name);
  };

  const setMenuPermissionAll = (menu: any[], value: boolean, name: string) => {
    return menu.map((item) => {
      let basePerm: any = {
        view: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        multiAction: false,
        disabled: false,
      };

      if (item.children?.length === 0) {
        basePerm = item?.permission ? item.permission : basePerm;

        const singlePerm = {
          ...basePerm,
          disabled: All.disabled,
          [name]: value,
        };
        setFinalObj((prevFinalObj: any) => ({
          ...prevFinalObj,
          [item.id]: singlePerm,
        }));

        item.permission = singlePerm;
        return item;
      } else if (item.children?.length > 0) {
        item.children = setMenuPermissionAll(item.children, value, name);
      }
      return item;
    });
  };

  // const handleSubmit = async () => {
  //   try {
  //     if (!roleId) {
  //       return toastAlert("warn", "Please Select Role");
  //     }
  //     setloading(true);
  //     let permission: any = {};

  //     // menuList.map((parent: any) => {
  //     //   if (parent?.children?.length) {
  //     //     parent.children.map((child: any) => {
  //     //       if (child?.permission) {
  //     //         const perm = child.permission;
  //     //         if (perm["add"] || perm["edit"] || perm["delete"]) {
  //     //           permission[child.id] = { ...child.permission, view: true };
  //     //         } else if (perm["view"]) {
  //     //           permission[child.id] = child.permission;
  //     //         }
  //     //       }
  //     //     });
  //     //   } else {
  //     //     if (parent?.permission) {
  //     //       const perm = parent.permission;
  //     //       if (perm["add"] || perm["edit"] || perm["delete"]) {
  //     //         permission[parent.id] = { ...parent.permission, view: true };
  //     //       } else if (perm["view"]) {
  //     //         permission[parent.id] = parent.permission;
  //     //       }
  //     //     }
  //     //   }
  //     // });
  //     // console.log(roleId, "roleId");
  //     // console.log(finalObjData, "finalObjDatafinalObjData");
  //     return;

  //     let addPermission = await api.post(`permission/addMenuPermission`, {
  //       id: roleId,
  //       // permission: JSON.stringify(finalObjData),
  //     });
  //     console.log(addPermission, "addPermissionaddPermission");
  //     toastAlert("success", "Permission added");
  //     setloading(false);

  //     //recall role dropdown list for updated permission
  //     getRoleList();
  //   } catch (error: any) {
  //     setloading(false);
  //     handleServerError(error);
  //   }
  // };

  const handleSubmit = async () => {
    if (!roleId) {
      return toastAlert("warn", "Please Select Role");
    } else if (!finalObj) {
      return toastAlert("error", "Permissions cannot be empty.");
    }

    try {
      const response = await api.post("permission/addMenuPermission", {
        id: roleId,
        permission: JSON.stringify(finalObj),
      });

      toastAlert("success", response.data.msg);
    } catch (error) {
      handleServerError(error);
    }
  };

  return (
    <div className="px-0">
      {/* <Card className="mt-6"> */}
        {/* <CardBody> */}
          <div className="flex justify-between  items-center px-5">
            <div>
              <CustomBackButton onClick={() => window.history.back()}>
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
               
              </CustomBackButton>
            </div>
            <div className="w-96 mt-5">
            <CustomReactSelect
                items={roleList}
                placeholder="Select Role"
                bindName="roleName"
                bindValue="id"
                onChange={(e: any) => {
                  changeRole(e);
                }}
                value={roleId}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 mt-0 bg-white py-5 rounded-xl">
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-0 border-b border-dashed border-gray-100 font-montserrat font-semibold bg-gray-50 pt-2">
              <div className="hidden sm:flex lg:justify-start xl:justify-start  lg:items-start px-5">
                <div>Title</div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="CustomText-center text-xs sm:text-base">View</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      checked={finalObj ? finalObj.viewAll : false} // Safely access finalObj.viewAll
                      id="viewAll"
                      onChange={(e: any) => allCheckboxClicked(e, "view")} // Ensure e is a boolean
                      disabled={finalObj ? finalObj.disabled : false}
                      // onCheckChange={(e: boolean) => allCheckboxClicked(e, "view")}
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="CustomText-center text-xs sm:text-base">Add</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      type="checkbox"
                      id="addAll"
                      checked={finalObj ? finalObj.addAll : false} // Nullish coalescing operator for default value
                      onChange={(e: any) => allCheckboxClicked(e, "add")} // Ensures boolean type
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="CustomText-center text-xs sm:text-base">Edit</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      id="editAll"
                      checked={finalObj ? finalObj.editAll : false}
                      onChange={(e: any) => allCheckboxClicked(e, "edit")}
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="flex justify-center text-xs sm:text-base">Delete</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      id="deleteAll"
                      checked={finalObj ? finalObj.deleteAll : false}
                      onChange={(e: any) => allCheckboxClicked(e, "delete")}
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="flex justify-center text-xs sm:text-base">Export</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      id="exportAll"
                      checked={finalObj ? finalObj.exportAll : false}
                      onChange={(e: any) => allCheckboxClicked(e, "export")}
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center gap-2">
                  <CustomText className="flex justify-center text-xs sm:text-base text-center">Multi Action</CustomText>
                  <div className="flex justify-center mb-3">
                    <CustomCheckBox
                      id="multiActionAll"
                      checked={finalObj ? finalObj.multiActionAll : false}
                      onChange={(e: any) =>
                        allCheckboxClicked(e, "multiAction")
                      }
                      className="checkbox-xs checkbox-secondary rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            {roleId ? (
              <>
                {menuList.length > 0 &&
                  menuList.map((item: any, index: number) => {
                    return (
                      <>
                        <div
                          className={`grid grid-cols-6 sm:grid-cols-7 gap-0 items-end sm:items-center self-center pb-5 sm:pb-0 ${item.children.length > 0 ? `` : `border-b border-solid border-gray-100`}`}
                          key={index}
                        >
                          <div className="my-2 px-5 col-span-6 sm:col-span-1 bg-black/5 sm:bg-transparent">
                            <h2>{item.title}</h2>
                          </div>
                          {!item.children.length ? (
                            <>
                              <div className="flex flex-col justify-center items-center view ">
                                <CustomText className="CustomText-center text-xs sm:hidden">View</CustomText>
                                <CustomCheckBox
                                  checked={
                                    item.permission
                                      ? item.permission["view"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  id={`view-${item.id}`}
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "view")
                                  }
                                  disabled={
                                    item.permission
                                      ? item.permission.disabled || false
                                      : false
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center add">
                                <CustomText className="CustomText-center text-xs sm:hidden">Add</CustomText>
                                <CustomCheckBox
                                  id={`add-${item.id}`}
                                  checked={
                                    item.permission
                                      ? item.permission["add"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "add")
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center edit">
                                <CustomText className="CustomText-center text-xs sm:hidden">Edit</CustomText>
                                <CustomCheckBox
                                  id={`edit-${item.id}`}
                                  checked={
                                    item.permission
                                      ? item.permission["edit"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "edit")
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center delete">
                                <CustomText className="CustomText-center text-xs sm:hidden">Delete</CustomText>
                                <CustomCheckBox
                                  id={`delete-${item.id}`}
                                  checked={
                                    item.permission
                                      ? item.permission["delete"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "delete")
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center export">
                                <CustomText className="CustomText-center text-xs sm:hidden">Export</CustomText>
                                <CustomCheckBox
                                  id={`export-${item.id}`}
                                  checked={
                                    item.permission
                                      ? item.permission["export"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "export")
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center multiAction">
                                <CustomText className="CustomText-center text-center text-xs sm:hidden">Multi Action</CustomText>
                                <CustomCheckBox
                                  id={`multiAction-${item.id}`}
                                  checked={
                                    item.permission
                                      ? item.permission["multiAction"]
                                        ? true
                                        : false
                                      : false
                                  }
                                  onChange={(e: any) =>
                                    checkboxClicked(e, item, "multiAction")
                                  }
                                  className="checkbox-xs checkbox-secondary rounded-sm"
                                />
                              </div>
                            </>
                          ) : null}
                        </div>
                        <div className="border-b border-solid border-gray-100">
                          {item.children.length > 0 &&
                            item.children.map(
                              (subMenu: any, subIndex: number) => {
                                return (
                                  <>
                                    <div
                                      className="grid grid-cols-6 sm:grid-cols-7 gap-0 items-end sm:items-center self-center"
                                      key={subIndex}
                                    >
                                      <div className="col-span-6 sm:col-span-1">
                                        {/* <h2>--User</h2> */}
                                        <CustomText className="ms-5 sm:ms-8 mb-3 flex items-center gap-2"><div className="bg-secondary rounded-full w-2 h-2"></div> {subMenu.title}</CustomText>
                                      </div>
                                      <div className="flex flex-col justify-center items-center view mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">View</CustomText>
                                        <CustomCheckBox
                                          id={`view-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission["view"]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(e, subMenu, "view")
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center items-center add mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">Add</CustomText>
                                        <CustomCheckBox
                                          id={`add-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission["add"]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(e, subMenu, "add")
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center items-center edit mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">Edit</CustomText>
                                        <CustomCheckBox
                                          id={`edit-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission["edit"]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(e, subMenu, "edit")
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center items-center delete mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">Delete</CustomText>
                                        <CustomCheckBox
                                          id={`delete-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission["delete"]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(
                                              e,
                                              subMenu,
                                              "delete"
                                            )
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center items-center export mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">Export</CustomText>
                                        <CustomCheckBox
                                          id={`export-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission["export"]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(
                                              e,
                                              subMenu,
                                              "export"
                                            )
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center items-center multiAction mb-3">
                                        <CustomText className="CustomText-center text-xs sm:hidden">Multi Action</CustomText>
                                        <CustomCheckBox
                                          id={`multiAction-${item.id}`}
                                          checked={
                                            subMenu.permission
                                              ? subMenu.permission[
                                                  "multiAction"
                                                ]
                                                ? true
                                                : false
                                              : false
                                          }
                                          onChange={(e: any) =>
                                            checkboxClicked(
                                              e,
                                              subMenu,
                                              "multiAction"
                                            )
                                          }
                                          className="checkbox-xs checkbox-secondary rounded-sm"
                                        />
                                      </div>
                                    </div>
                                  </>
                                );
                              }
                            )}
                        </div>
                      </>
                    );
                  })}
              </>
            ) : null}
          </div>
        {/* </CardBody> */}
      {/* </Card> */}
      <div className="justify-end CustomText-end flex my-0 px-5 py-5">
        <CustomButton type="submit" onClick={handleSubmit} className="">
          Save
        </CustomButton>
      </div>
    </div>
  );
}
