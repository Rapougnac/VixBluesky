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
