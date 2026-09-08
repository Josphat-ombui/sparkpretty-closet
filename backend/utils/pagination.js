export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE));
  return { page, limit, skip: (page - 1) * limit };
}

export async function paginate(model, filter = {}, query = {}, options = {}) {
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    model.find(filter)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(options.populate || []),
    model.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
  };
}
