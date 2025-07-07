import {
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginationResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

const paginate = async <T extends ObjectLiteral>(
  source: SelectQueryBuilder<T> | Repository<T>,
  {
    page = 1,
    limit = 10,
    findOptions,
  }: PaginationOptions & { findOptions?: FindManyOptions<T> },
): Promise<PaginationResult<T>> => {
  const pageNumber = Math.max(1, parseInt(page.toString(), 10));
  const pageLimit = Math.max(1, parseInt(limit.toString(), 10));

  const skip = (pageNumber - 1) * pageLimit;

  let items: T[], totalCount: number;
  if ('findAndCount' in source) {
    const opts: FindManyOptions<T> = {
      skip,
      take: pageLimit,
      ...(findOptions || {}),
    };
    [items, totalCount] = await source.findAndCount(opts);
  } else {
    [items, totalCount] = await source
      .skip(skip)
      .take(pageLimit)
      .getManyAndCount();
  }

  const totalPages = Math.ceil(totalCount / pageLimit);

  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  return {
    data: items,
    meta: {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      pageSize: pageLimit,
      hasPreviousPage,
      hasNextPage,
    },
  };
};

export default paginate;
