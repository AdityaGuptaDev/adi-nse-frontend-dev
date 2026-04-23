//@ts-nocheck
let configData = {
  development: {
    ApiUrl: "http://localhost:9075", //ApiUrl: "http://localhost:9075"
    //ApiUrl: "https://vedantmf.com/api/",
    adminURL: "http://localhost:4200",
    baseUrl: "",
    publicBasePath: "",
    websiteUrl: "http://localhost:3001"
  },
  staging: {
    ApiUrl: "https://vedant.prosesenv.com:9075",
    adminURL: "",
    baseUrl: "",
    publicBasePath: "",
    websiteUrl: ""
  },
  production: {
    //ApiUrl: "https://vedantmf.com/api/",
    ApiUrl: "http://localhost:9075",
    adminURL: "",
    baseUrl: "",
    publicBasePath: "",
    //websiteUrl: "https://vedantmf.com"
    websiteUrl: "http://localhost:3000"
  },
};

export default function (env: string): {
  ApiUrl: string;
  adminURL: string;
  baseUrl: string;
  publicBasePath: string;
  websiteUrl: string;
} {
  return configData[env];
}
