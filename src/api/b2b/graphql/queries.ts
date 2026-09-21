export const GET_BRAND_TYPES_B2B_FORM = `
  query GetBrandTypesB2bForm {
    getBrandTypesB2bForm {
      id
      name
    }
  }
`;

export const GET_COLLECTABLES = `
  query GetCollectables($channels: [Channel!]!, $country_code: String) {
    getCollectables(channels: $channels, country_code: $country_code) {
      id
      name_ar
      name_en
      name_de
      image
      flow
      is_primary
      total_count
      remaining_count
      consumed_count
      measures {
        id
        name_ar
        name_de
        name_en
      }
    }
  }
`;

export const GET_BRANCH_FRESH_PRODUCTS_WEBFORM = `
  query GetBranchFreshProductsWebform($branch_id: ID!) {
    getBranchFreshProductsWebform(branch_id: $branch_id) {
      id
      name
      size
      selling_price
      warehouse_stock
      min_qty_per_order
    }
  }
`;
