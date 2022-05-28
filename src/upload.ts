import https from "https";
import {
  fileName,
  fileContent,
  // fileVersion,
  timestamp,
  uuid,
  encodeURLParams,
} from "./utils";
import { UploadParams, PublicParams, t2endpoint } from "./constants";
import { signQuery } from "./signature";
import type { ArmsConfig } from "./types";

export function uploadFile(file: string, armsConfig: ArmsConfig) {
  const httpMethod = "POST";

  const {
    accessKeyId,
    accessKeySecret,
    pid,
    regionId = UploadParams.DefaultRegionId,
  } = armsConfig;
  const endpoint = armsConfig.endpoint || t2endpoint({ regionId });

  const filename = fileName(file);
  const filecontent = fileContent(file);
  // const version = fileVersion(file);

  // Upload参数  详见 ./constants.ts
  const uploadParams = {
    Action: UploadParams.Action,
    RegionId: regionId,
    Pid: pid,
    FileName: filename,
    File: filecontent,
    // Version: version, // 绝了! 跟公共参数有冲突, 写得好呀阿里云👍
  };

  // 公共参数  详见 ./constants.ts
  const publicParams = {
    Format: PublicParams.Format,
    Version: PublicParams.Version,
    AccessKeyId: accessKeyId,
    SignatureMethod: PublicParams.SignatureMethod,
    Timestamp: timestamp(),
    SignatureVersion: PublicParams.SignatureVersion,
    SignatureNonce: uuid(),
  };

  const signature = signQuery(
    { ...uploadParams, ...publicParams },
    httpMethod,
    accessKeySecret + "&"
  );

  const params = {
    ...uploadParams,
    ...publicParams,
    Signature: signature,
  };

  const url = `https://${endpoint}/?${encodeURLParams(params)}`;

  return new Promise((resolve, reject) => {
    // 阿里云API目前有bug:
    //   只能通过 URL 传参的方式上传文件内容, 但文件过大时会触发 HTTP 414 414 Request-URI Too Large
    // 等待处理中...
    let contentType = "";
    // contentType = 'application/json'
    // contentType = 'multipart/form-data'
    // contentType = 'application/x-www-form-urlencoded'

    const req = https.request(
      url,
      {
        method: httpMethod,
        headers: {
          "Content-Type": contentType,
        },
      },
      (res) => {
        const chunks: Uint8Array[] = [];
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          const body = Buffer.concat(chunks).toString();
          if (res.statusCode === 200) {
            resolve(body);
          } else {
            reject(body);
          }
        });

        res.on("error", function (error) {
          reject(error);
        });
      }
    );

    let postData;
    if (contentType === "application/json") {
      postData = JSON.stringify({
        File: filecontent,
      });
    }

    if (contentType === "application/x-www-form-urlencoded") {
      postData = encodeURLParams({
        File: filecontent,
      });
    }

    if (contentType === "multipart/form-data") {
      postData =
        `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"File\"; filename=\"${filename}\"\r\nContent-Type: \"{Insert_File_Content_Type}\"\r\n\r\n` +
        filecontent +
        "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
      req.setHeader(
        "content-type",
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
      );
    }

    if (postData) req.write(postData);

    req.on("error", function (error) {
      reject(error);
    });

    req.end();
  });
}
