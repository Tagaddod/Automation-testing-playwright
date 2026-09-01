export const GET_CURRENT_CUSTOMER = `
  query GetCurrentCustomer {
    myCustomer {
      id
      name
      phone
      country_code
      points
      addresses {
        id
        latitude
        longitude
        description
        primary
      }
    }
  }
`;

export const GET_B2C_COLLECTABLES = `
  query GetB2cCollectables(
    $channels: [Channel!]!
    $country_code: String
  ) {
    getCollectables(channels: $channels, country_code: $country_code) {
      id
      name
      name_ar
      name_en
      image
      measures {
        id
        name
        name_ar
        name_en
        unit
        price
      }
    }
  }
`;

export const GET_B2C_WEB_COLLECTABLES = `
  query GetB2cWebCollectables(
    $channels: [Channel!]!
    $country_code: String
  ) {
    webFormGetCollectables(
      channels: $channels
      country_code: $country_code
    ) {
      id
      name
      name_ar
      name_en
      image
      measures {
        id
        name
        name_ar
        name_en
        unit
        price
      }
    }
  }
`;
