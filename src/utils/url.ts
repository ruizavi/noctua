export const checkOptionalParameter = (path: string): string[] | null => {
  /*
   If path is `/api/animals/:type?` it will return:
   [`/api/animals`, `/api/animals/:type`]
   in other cases it will return null
  */

  if (!path.match(/\:.+\?$/)) {
    return null;
  }

  const segments = path.split("/");
  const results: string[] = [];
  let basePath = "";

  for (const segment of segments) {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += `/${segment}`;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += `/${optionalSegment}`;
        results.push(basePath);
      } else {
        basePath += `/${segment}`;
      }
    }
  }

  return results.filter((v, i, a) => a.indexOf(v) === i);
};

export const addSlash = (path?: string): string =>
  path && typeof path === "string"
    ? path.charAt(0) !== "/"
      ? `/${path}`
      : path
    : "";
