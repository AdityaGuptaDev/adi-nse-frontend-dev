export const permittedActionbtn = (actionButtons: any[], perm: any) => {
  let btns: any[] = [];
  actionButtons.map((btn: any) => {
    if (["View", "Edit", "Delete"].includes(btn.title)) {
      if (btn.title === "View" && perm?.["view"]) {
        btns.push(btn);
      }
      if (btn.title === "Edit" && perm?.["edit"]) {
        btns.push(btn);
      }
      if (btn.title === "Delete" && perm?.["delete"]) {
        btns.push(btn);
      }
    } else {
      btns.push(btn);
    }
  });
  return btns;
};
