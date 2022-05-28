import fs from "fs";
import fg from "fast-glob";
import crypto from "crypto";

export function paramsToObject(entries: string[][]) {
  return entries.reduce((result, [key, value]) => {
    result[key] = value;
    return result;
  }, {} as Record<string, string>);
}

export async function globFiles(blob: string) {
  const paths = await fg(blob);
  return paths;
}

export function fileContent(file: string) {
  return fs.readFileSync(file).toString();
}

export function fileName(file: string) {
  return file.split("/").pop()!;
}

export function fileVersion(_file: string) {
  return "";
}

export function timestamp() {
  return new Date().toISOString();
}

export function uuid() {
  return crypto.randomUUID();
}

export function template(
  strings: TemplateStringsArray,
  ...keys: (string | number)[]
) {
  return (...values: (string | Record<string, string>)[]) => {
    const dict: Record<string, string> = (values[values.length - 1] as Record<string, string>) || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? (values as string[])[key as number] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
}

export function fixedEncodeURIComponent(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

export function encodeURLParams(params: Record<string, string>) {
  const entries = Object.entries(params);
  const result = entries
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return result;
}
