import crypto from "crypto";
import { fixedEncodeURIComponent, paramsToObject } from "./utils.js";

function canonicalizeQuery(query: Record<string, string>) {
  const entries = Object.entries(query).sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });
  const result = entries
    .map(([key, value]) => `${key}=${fixedEncodeURIComponent(value)}`)
    .join("&");
  return result;
}

function assembleTextToSign(httpMethod: string, canonicalizedQueryString: string) {
  return `${httpMethod.toUpperCase()}&${fixedEncodeURIComponent('/')}&${fixedEncodeURIComponent(canonicalizedQueryString)}`;
}

function sign(text: string, key: string) {
  return crypto.createHmac("sha1", key).update(text).digest("base64");
}

export function signQuery(
  query: Record<string, string>,
  httpMethod: string,
  key: string
) {
  const canonicalizedQuery = canonicalizeQuery(query);
  const textToSign = assembleTextToSign(httpMethod, canonicalizedQuery);
  const signature = sign(textToSign, key);
  return signature;
}

export function signURL(url: string, httpMethod: string, key: string) {
  if (!url.startsWith("http")) {
    url = "http://" + url;
  }
  const searchParams = new URL(url).searchParams;

  const query = paramsToObject(Array.from(searchParams));
  const signature = signQuery(query, httpMethod, key);
  return signature;
}
