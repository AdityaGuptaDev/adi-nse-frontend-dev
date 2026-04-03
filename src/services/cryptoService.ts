"use server";

import CryptoJS from "crypto-js";

const secretKey = process.env.CRYPTO_SECRET!;

const stringifier = async (data: any) => {
  try {
    return JSON.stringify(data);
  } catch (error: any) {
    return data;
  }
};

const parser = async (data: any) => {
  try {
    return JSON.parse(data);
  } catch (error: any) {
    return data;
  }
};

export const encrypt = async (data: any) => {
  try {
    if (!data) {
      return data;
    }
    const secretMessage = await stringifier(data);
    const encrypted = CryptoJS.AES.encrypt(secretMessage, secretKey).toString();
    // return encrypted.replace(/\s+/g, "");
    return encrypted;
  } catch (error: any) {
    console.log("--------------------ENCRYPT ERROR------------------", error);
    return null;
  }
};

export const decrypt = async (data: string) => {
  try {
    if (!data) {
      return data;
    }
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    return await parser(decryptedMessage);
  } catch (error: any) {
    console.log("--------------------DECRYPT ERROR------------------", error);
    return null;
  }
};
