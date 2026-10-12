const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const paginationRequested = (query = {}) => query.page !== undefined || query.limit !== undefined;

export const parsePagination = (query = {}, defaultLimit = DEFAULT_LIMIT) => {
  const page = positiveInteger(query.page, 1);
  const limit = Math.min(positiveInteger(query.limit, defaultLimit), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

export const paginationMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

