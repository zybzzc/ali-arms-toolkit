var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import https from "https";
import { fileName, fileContent, timestamp, uuid, encodeURLParams, } from "./utils";
import { UploadParams, PublicParams, t2endpoint } from "./constants";
import { signQuery } from "./signature";
export function uploadFile(file, armsConfig) {
    var httpMethod = "POST";
    var accessKeyId = armsConfig.accessKeyId, accessKeySecret = armsConfig.accessKeySecret, pid = armsConfig.pid, _a = armsConfig.regionId, regionId = _a === void 0 ? UploadParams.DefaultRegionId : _a;
    var endpoint = armsConfig.endpoint || t2endpoint({ regionId: regionId });
    var filename = fileName(file);
    var filecontent = fileContent(file);
    var uploadParams = {
        Action: UploadParams.Action,
        RegionId: regionId,
        Pid: pid,
        FileName: filename,
        File: filecontent,
    };
    var publicParams = {
        Format: PublicParams.Format,
        Version: PublicParams.Version,
        AccessKeyId: accessKeyId,
        SignatureMethod: PublicParams.SignatureMethod,
        Timestamp: timestamp(),
        SignatureVersion: PublicParams.SignatureVersion,
        SignatureNonce: uuid(),
    };
    var signature = signQuery(__assign(__assign({}, uploadParams), publicParams), httpMethod, accessKeySecret + "&");
    var params = __assign(__assign(__assign({}, uploadParams), publicParams), { Signature: signature });
    var url = "https://" + endpoint + "/?" + encodeURLParams(params);
    return new Promise(function (resolve, reject) {
        var contentType = "";
        var req = https.request(url, {
            method: httpMethod,
            headers: {
                "Content-Type": contentType,
            },
        }, function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () {
                var body = Buffer.concat(chunks).toString();
                if (res.statusCode === 200) {
                    resolve(body);
                }
                else {
                    reject(body);
                }
            });
            res.on("error", function (error) {
                reject(error);
            });
        });
        var postData;
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
                "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"File\"; filename=\"" + filename + "\"\r\nContent-Type: \"{Insert_File_Content_Type}\"\r\n\r\n" +
                    filecontent +
                    "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
            req.setHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
        }
        if (postData)
            req.write(postData);
        req.on("error", function (error) {
            reject(error);
        });
        req.end();
    });
}
//# sourceMappingURL=upload.js.map