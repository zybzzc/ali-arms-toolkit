import crypto from "crypto";
import { fixedEncodeURIComponent, paramsToObject } from "./utils.js";
function canonicalizeQuery(query) {
    var entries = Object.entries(query).sort(function (a, b) {
        return a[0].localeCompare(b[0]);
    });
    var result = entries
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + fixedEncodeURIComponent(value);
    })
        .join("&");
    return result;
}
function assembleTextToSign(httpMethod, canonicalizedQueryString) {
    return httpMethod.toUpperCase() + "&" + fixedEncodeURIComponent('/') + "&" + fixedEncodeURIComponent(canonicalizedQueryString);
}
function sign(text, key) {
    return crypto.createHmac("sha1", key).update(text).digest("base64");
}
export function signQuery(query, httpMethod, key) {
    var canonicalizedQuery = canonicalizeQuery(query);
    var textToSign = assembleTextToSign(httpMethod, canonicalizedQuery);
    var signature = sign(textToSign, key);
    return signature;
}
export function signURL(url, httpMethod, key) {
    if (!url.startsWith("http")) {
        url = "http://" + url;
    }
    var searchParams = new URL(url).searchParams;
    var query = paramsToObject(Array.from(searchParams));
    var signature = signQuery(query, httpMethod, key);
    return signature;
}
//# sourceMappingURL=signature.js.map