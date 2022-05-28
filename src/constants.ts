import { template } from "./utils";

// Endpoint 即接入地址  https://help.aliyun.com/document_detail/42924.html#section-m38-3x3-jky
export const t2endpoint = template`arms.${"regionId"}.aliyuncs.com`;

// Upload参数  https://help.aliyun.com/document_detail/425004.html
export const UploadParams = {
  Action: "Upload",

  DefaultRegionId: "cn-hangzhou",
} as const;

// 公共参数 https://help.aliyun.com/document_detail/196742.html
export const PublicParams = {
  Format: "JSON",

  Version: "2019-08-08",

  SignatureMethod: "HMAC-SHA1",

  SignatureVersion: "1.0",
} as const;
