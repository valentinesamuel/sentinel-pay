import {
  FindOptionsRelationByString,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { IPaged } from '../interface/paged.interface';
import { IQuery } from '../interface/query.interface';

export function combineAndWithOr(filterAnd: any, filterOr: any) {
  filterAnd = filterAnd ?? {};
  filterOr = filterOr ?? {};
  const where = { ...filterAnd };
  const combined = [];
  if (filterOr && Object.keys(filterOr).length > 0) {
    Object.keys(filterOr).forEach((key) => {
      combined.push({ ...where, [key]: filterOr[key] });
    });
  }
  return combined.length > 0 ? combined : where;
}

function formatQuery(filter: any) {
  const obj = {};
  if (filter && isArray(filter)) {
    return filter;
  }
  if (filter && isObject(filter)) {
    Object.keys(filter).forEach((key) => {
      if (isArray(filter[key]) && isArrayOfStringOrNumber(filter[key])) {
        obj[key] = In(filter[key]);
      } else if (isObject(filter[key])) {
        obj[key] = filter[key];
      } else {
        obj[key] = filter[key];
      }
    });
  }
  return obj;
}

function isArrayOfStringOrNumber(value: any): boolean {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' || typeof item === 'number')
  );
}

function isArray(value: any): boolean {
  return Array.isArray(value);
}

function isObject(value: any): boolean {
  return typeof value === 'object' && !Array.isArray(value);
}

/**
 * Converts query parameters to a more structured object.
 * @param query - The query parameters as an unstructured object.
 * @returns A structured object with typed values.
 */
export function convertQueryParamsToObject(query: any): any {
  const obj: any = {};
  Object.keys(query).forEach((key) => {
    if (query[key] === 'true') {
      obj[key] = true;
    } else if (query[key] === 'false') {
      obj[key] = false;
    } else if (query[key] === 'null') {
      obj[key] = null;
    } else if (/^[0-9\.]+$/.test(query[key])) {
      obj[key] = Number(query[key]);
    } else if (
      (typeof query[key] == 'string' &&
        query[key] &&
        query[key].trim().startsWith('{') &&
        query[key].trim().endsWith('}'))
      ||
      (typeof query[key] == 'string' &&
        query[key] &&
        query[key].trim().startsWith('[') &&
        query[key].trim().endsWith(']'))
    ) {
      if (query[key].trim().charAt(1) === '"') {
        obj[key] = JSON.parse(query[key]);
      } else if (query[key].trim().charAt(1) !== '"') {
        obj[key] = query[key]
          .trim()
          .replace(/[\[\]']+/g, '')
          .split(',')
          .map((e) => e.trim());
      }
    } else if (typeof query[key] == 'object') {
      obj[key] = query[key];
    } else {
      obj[key] = query[key];
    }
  });
  return obj;
}

/**
 * Paginates and filters repository results based on query parameters.
 * @param repository - The repository to query.
 * @param query - The query parameters including pagination and filters.
 * @param qWhere - Additional query conditions.
 * @returns A promise that resolves to a paginated result object.
 * example usage: To use a filter
 * // ?filter[businessId]=75352a3e-74f2-4e7f-ac90-db419004bc16 => where businessId = '75352a3e-74f2-4e7f-ac90-db419004bc16'
 * // ?filterOr[name]=john&filterOr[name]=sarah => where name = 'john' or name = 'sarah'
 * // ?filter[businessId]=75352a3e-74f2-4e7f-ac90-db419004bc16&filterOr[name]=john&filterOr[description]=john => where businessId = '75352a3e-74f2-4e7f-ac90-db419004bc16' and (name = 'john' or description = 'john')
 * // ?filter[name] = [john, sarah] => where name in ('%john%', '%sarah%')
 * // ?filterOr[name] = [john, sarah] => where name in ('%john%', '%sarah%')
 */


export async function findAndPaginate<T>(
  repository: Repository<T>,
  query: IQuery,
  qWhere?: FindOptionsWhere<T>,
  relations?: FindOptionsRelations<T> | FindOptionsRelationByString,
  select?: (keyof T)[] | FindOptionsSelect<T>,
  options?: { withDeleted?: boolean },
): Promise<IPaged<T[]>> {
  query.page = Number(query.page) > 1 ? Number(query.page) - 1 : 0;
  const take = Number(query.limit) || 10;
  const skip = query.page * take || 0;
  const whereAnd = { ...qWhere, ...formatQuery(query.filter) };
  const whereOr = formatQuery(query.filterOr);

  let order = { createdAt: 'DESC' } as any;
  if (query.order && typeof query.order === 'object') {
    const orderKey = Object.keys(query.order)[0];
    order = { [orderKey]: query.order[orderKey] };
  }

  let where = combineAndWithOr(whereAnd, whereOr);

  // Search records by table attributes
  if (query.search && typeof query.search === 'object' && Object.keys(query.search).length > 0) {
    const previousFilter = where;
    where = [];
    Object.keys(query.search).forEach((key) => {
      if (typeof query.search[key] === 'object') {
        where[key] = {};
        for (const nestedKey of Object.keys(query.search[key])) {
          where.push({
            [key]: { [nestedKey]: ILike(`%${query.search[key][nestedKey]}%`), ...previousFilter },
          });
        }
      } else {
        where.push({ [key]: ILike(`%${query.search[key]}%`), ...previousFilter });
      }
    });
    // }
  }

  const [result, total] = await repository.findAndCount({
    where,
    order,
    take: take,
    skip: skip,
    relations,
    select,
    withDeleted: options?.withDeleted,
  });

  const mainPage = query.page + 1;
  const numberOfPages = Math.ceil(total / take);
  const nextPage = mainPage + 1;

  return {
    data: result,
    meta: {
      page: mainPage,
      limit: take,
      count: result.length,
      previousPage: mainPage > 1 ? mainPage - 1 : false,
      nextPage: numberOfPages >= nextPage ? nextPage : false,
      pageCount: numberOfPages,
      totalRecords: total,
    },
  };
}
