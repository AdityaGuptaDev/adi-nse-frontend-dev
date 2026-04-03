import { NextRequest, NextResponse } from "next/server";


const handlePrismaError = (error: any = null) => {
  /**
 * {
        "name": "PrismaClientKnownRequestError",
        "code": "P2002",
        "clientVersion": "5.17.0",
        "meta": {
            "modelName": "user",
            "target": "user_email_key"
        }
    }
 */

  if (!error) return "";
  if (error?.name === "PrismaClientKnownRequestError") {
    if (error?.code === "P2002") {
      return `${error?.meta?.target} already exist`;
    } if (error?.code === "P2025") {
      return `${error?.meta?.cause}`;
    } else {
      return "";
    }
  }
};
//200 OK

export const successResponse = async ({
  data = null,
  msg = "",
}: {
  data: any;
  msg: any;
}) => {

  // let encryptedData = await encrypt(data);
  // NextResponse.json(data, { status: 200 })
  // return NextResponse.json({ data: encryptedData, msg }, { status: 200 });
  return NextResponse.json({ data, msg }, { status: 200 });
};

//500 SERVER ERROR
export const serverError = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg?: string;
  error?: any;
}) => {
  msg = msg || error?.message || handlePrismaError(error) || "internal server error";
  return NextResponse.json({ data, msg, error }, { status: 500 });
};

//404 Not Found
export const notFoundResponse = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg: string;
  error?: any;
}) => {
  return NextResponse.json(
    { data, msg: msg || "not found", error },
    { status: 404 }
  );
};

//401 Unauthorized
export const unauthorized = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg: string;
  error?: any;
}) => {
  return NextResponse.json(
    { data, msg: msg || "unauthorized", error },
    { status: 401 }
  );
};

//400 Bad Request
export const other = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg?: string;
  error: any;
}) => {
  return NextResponse.json(
    { data, msg: msg || "bad request", error },
    { status: 400 }
  );
};

//409 conflict (Used for duplicate values mainly)
export const alreadyExist = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg: string;
  error?: any;
}) => {
  return NextResponse.json(
    { data, msg: msg || "already exist", error },
    { status: 409 }
  );
};

//requires fields
export const requiredFieldsEmpty = ({
  data = null,
  msg = "",
  error = null,
}: {
  data?: any;
  msg: string;
  error: any;
}) => {
  return NextResponse.json(
    { data, msg: msg || "validation error", error },
    { status: 422 }
  );
};
