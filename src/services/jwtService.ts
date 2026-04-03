"use server"


import { SignJWT, jwtVerify } from "jose";
import { TextEncoder } from "util";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export const generateToken = async (payload: any, exp?:any) => {
  if (!payload) {
    return null;
  }
  const jwtToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp || "1d")
    .sign(secret);
  return jwtToken;
};

export const verifiyToken = async (jwtToken: string) => {
  const result = await jwtVerify(jwtToken, secret);
  return result?.payload;
};
