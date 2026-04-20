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
    console.log(event, "eventeventevent");
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
    <div className="min-h-screen bg-[#0A0A0A] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <CustomBackButton onClick={() => window.history.back()}>
              <IoMdArrowRoundBack className="h-6 w-6 mr-1 text-[#F59E0B] hover:text-[#FBBF24] transition-colors" />
            </CustomBackButton>
          </div>
          <div className="w-96">
            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
              Select Role <span className="text-[#F59E0B]">*</span>
            </label>
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
              className="z-50"
            />
          </div>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-6 sm:grid-cols-7 gap-0 border-b border-[#2A2A2A] bg-[#1F1A1A] pt-2">
            <div className="hidden sm:flex lg:justify-start xl:justify-start lg:items-start px-5 py-3">
              <CustomText className="text-[#F59E0B] font-semibold">Title</CustomText>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="text-center text-xs sm:text-sm text-[#F9FAFB] font-medium">View</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    checked={finalObj ? finalObj.viewAll : false}
                    id="viewAll"
                    onChange={(e: any) => allCheckboxClicked(e, "view")}
                    disabled={finalObj ? finalObj.disabled : false}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="text-center text-xs sm:text-sm text-[#F9FAFB] font-medium">Add</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    type="checkbox"
                    id="addAll"
                    checked={finalObj ? finalObj.addAll : false}
                    onChange={(e: any) => allCheckboxClicked(e, "add")}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="text-center text-xs sm:text-sm text-[#F9FAFB] font-medium">Edit</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    id="editAll"
                    checked={finalObj ? finalObj.editAll : false}
                    onChange={(e: any) => allCheckboxClicked(e, "edit")}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="flex justify-center text-xs sm:text-sm text-[#F9FAFB] font-medium">Delete</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    id="deleteAll"
                    checked={finalObj ? finalObj.deleteAll : false}
                    onChange={(e: any) => allCheckboxClicked(e, "delete")}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="flex justify-center text-xs sm:text-sm text-[#F9FAFB] font-medium">Export</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    id="exportAll"
                    checked={finalObj ? finalObj.exportAll : false}
                    onChange={(e: any) => allCheckboxClicked(e, "export")}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center py-3">
              <div className="flex flex-col justify-center gap-2">
                <CustomText className="flex justify-center text-xs sm:text-sm text-[#F9FAFB] font-medium text-center">Multi Action</CustomText>
                <div className="flex justify-center">
                  <CustomCheckBox
                    id="multiActionAll"
                    checked={finalObj ? finalObj.multiActionAll : false}
                    onChange={(e: any) => allCheckboxClicked(e, "multiAction")}
                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {roleId ? (
            <>
              {menuList.length > 0 &&
                menuList.map((item: any, index: number) => {
                  return (
                    <div key={index}>
                      <div
                        className={`grid grid-cols-6 sm:grid-cols-7 gap-0 items-end sm:items-center self-center pb-3 sm:pb-2 ${item.children.length > 0 ? `` : `border-b border-[#2A2A2A]`}`}
                      >
                        <div className="my-2 px-5 col-span-6 sm:col-span-1 bg-[#1F1A1A]/50 sm:bg-transparent py-2">
                          <h2 className="text-[#F9FAFB] font-medium">{item.title}</h2>
                        </div>
                        {!item.children.length ? (
                          <>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">View</CustomText>
                              <CustomCheckBox
                                checked={item.permission ? item.permission["view"] ? true : false : false}
                                id={`view-${item.id}`}
                                onChange={(e: any) => checkboxClicked(e, item, "view")}
                                disabled={item.permission ? item.permission.disabled || false : false}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Add</CustomText>
                              <CustomCheckBox
                                id={`add-${item.id}`}
                                checked={item.permission ? item.permission["add"] ? true : false : false}
                                onChange={(e: any) => checkboxClicked(e, item, "add")}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Edit</CustomText>
                              <CustomCheckBox
                                id={`edit-${item.id}`}
                                checked={item.permission ? item.permission["edit"] ? true : false : false}
                                onChange={(e: any) => checkboxClicked(e, item, "edit")}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Delete</CustomText>
                              <CustomCheckBox
                                id={`delete-${item.id}`}
                                checked={item.permission ? item.permission["delete"] ? true : false : false}
                                onChange={(e: any) => checkboxClicked(e, item, "delete")}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Export</CustomText>
                              <CustomCheckBox
                                id={`export-${item.id}`}
                                checked={item.permission ? item.permission["export"] ? true : false : false}
                                onChange={(e: any) => checkboxClicked(e, item, "export")}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Multi Action</CustomText>
                              <CustomCheckBox
                                id={`multiAction-${item.id}`}
                                checked={item.permission ? item.permission["multiAction"] ? true : false : false}
                                onChange={(e: any) => checkboxClicked(e, item, "multiAction")}
                                className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                              />
                            </div>
                          </>
                        ) : null}
                      </div>

                      {/* Submenu Items */}
                      {item.children.length > 0 && (
                        <div className="border-t border-[#2A2A2A] bg-[#1F1A1A]/30">
                          {item.children.map((subMenu: any, subIndex: number) => {
                            return (
                              <div
                                className="grid grid-cols-6 sm:grid-cols-7 gap-0 items-end sm:items-center self-center border-b border-[#2A2A2A] last:border-b-0"
                                key={subIndex}
                              >
                                <div className="col-span-6 sm:col-span-1 py-2">
                                  <CustomText className="ms-5 sm:ms-8 mb-0 flex items-center gap-2 text-[#9CA3AF]">
                                    <div className="bg-[#F59E0B] rounded-full w-2 h-2"></div>
                                    {subMenu.title}
                                  </CustomText>
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">View</CustomText>
                                  <CustomCheckBox
                                    id={`view-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["view"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "view")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Add</CustomText>
                                  <CustomCheckBox
                                    id={`add-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["add"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "add")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Edit</CustomText>
                                  <CustomCheckBox
                                    id={`edit-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["edit"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "edit")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Delete</CustomText>
                                  <CustomCheckBox
                                    id={`delete-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["delete"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "delete")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Export</CustomText>
                                  <CustomCheckBox
                                    id={`export-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["export"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "export")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col justify-center items-center py-2">
                                  <CustomText className="text-center text-xs sm:hidden text-[#9CA3AF]">Multi Action</CustomText>
                                  <CustomCheckBox
                                    id={`multiAction-${subMenu.id}`}
                                    checked={subMenu.permission ? subMenu.permission["multiAction"] ? true : false : false}
                                    onChange={(e: any) => checkboxClicked(e, subMenu, "multiAction")}
                                    className="checkbox-xs rounded-sm border-[#F59E0B]/30 checked:bg-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#9CA3AF]">Please select a role to view permissions</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}