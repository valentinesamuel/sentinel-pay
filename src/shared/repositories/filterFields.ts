/**
 * Filters an object by keys provided in an array of strings.
 * @param record - The object to be filtered.
 * @param fields - Array of strings representing the keys to keep in the object.
 * @returns A new object containing only the keys specified in the fields array.
 */
export function filterFields<T extends object, K extends keyof T>(
  record: T,
  fields: K[],
): Pick<T, K> {
  return fields.reduce(
    (filteredObj, field) => {
      if (field in record) {
        filteredObj[field] = record[field];
      }
      return filteredObj;
    },
    {} as Pick<T, K>,
  );
}
