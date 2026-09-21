export const GET_COLLECTABLES = `
  query GetCollectables($channels: [Channel!]!, $country_code: String) {
    getCollectables(channels: $channels, country_code: $country_code) {
      id
      name_ar
      name_en
      name_de
      image
      seller_extra_data
      flow
      is_primary
      total_count
      remaining_count
      consumed_count
      measures {
        name_ar
        name_en
        name_de
        id
        unit
        price
      }
    }
  }
`;
