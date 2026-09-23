/**
 * HealthPulse AI - Pagination Helper Utility
 * Standardizes query pagination metadata across all API endpoints with zero breaking changes.
 */

const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';
  const populate = options.populate || '';

  const skip = (page - 1) * limit;

  let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit);

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }
  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  const [data, total] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages
  };
};

module.exports = paginate;
