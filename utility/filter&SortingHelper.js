// Utility function to build filters based on query parameters
export const buildFilters = (category, level, primaryLanguage) => {
  const filters = {};

  // Add category filter if provided
  if (category?.length) {
    filters.category = { $in: category.split(",") };
  }

  // Add level filter if provided
  if (level?.length) {
    filters.level = { $in: level.split(",") };
  }

  // Add primary language filter if provided
  if (primaryLanguage?.length) {
    filters.primaryLanguage = { $in: primaryLanguage.split(",") };
  }

  return filters;
};

// Utility function to build sorting parameter
export const buildSortParam = (sortBy) => {
  const sortOptions = {
    "price-lowtohigh": { pricing: 1 },
    "price-hightolow": { pricing: -1 },
    "title-atoz": { title: 1 },
    "title-ztoa": { title: -1 },
  };

  // Return the corresponding sort option, or default to "price-lowtohigh"
  return sortOptions[sortBy] || { pricing: 1 };
};
