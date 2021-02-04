// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
// seems to preserve key ordering, but sort just in case
// tag/key1:value1,key2:value2,...,keyN:valueN
export const serialize = <P>(tag: string, params: P): string => {
    const sortedParams = Object.entries(params).sort((a, b) =>
        a[0].toString() < b[0].toString() ? -1 : 1
    );

    // NOTE: this method does NOT escape special characters used here (":" "," "/")
    const serializedParams = sortedParams
        .map(([key, val]) => `${key}:${val}`)
        .join(',');

    return `${tag}/${serializedParams}`;
};

// this implementation has really weak type checking
export const clearUndefinedFields = <T>(obj: T): T =>
    Object.entries(obj)
        .filter(([_, val]) => val !== undefined)
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {} as T);
