export function paginate(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: data,
    meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: totalPages,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
    },
  };
}
