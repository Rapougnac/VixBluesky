import { StreamInfo } from "./processVideoEmbed";

export const concatQueryParams = (params: Record<string, string | string[]>) =>
  Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${v}`).join("&");
      }
      return `${key}=${value}`;
    })
    .join("&");

export const join = (t: string | string[], s: string) =>
  Array.isArray(t) ? t.join(s) : t;

export const checkType = (t: string, o: any) =>
  (typeof o?.$type === "string" && o?.$type.startsWith(t)) || o?.$type === t;

export const indent = (s: string, n: number) =>
  s
    .split("\n")
    .map((l) => " ".repeat(n) + l)
    .join("\n");

export const constructVideoUrl = (streamInfo: StreamInfo, apiUrl: string) => {
  const url = new URL(streamInfo.masterUri);

  const [did, id, quality] = url.pathname.split("/").slice(2);

  const parts = [did, id, quality];

  return `${apiUrl}generate/${btoa(join(parts, ";"))}.mp4`;
};
