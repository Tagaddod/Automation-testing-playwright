export const CREATE_CUSTOMER_REQUEST = `
  mutation CreateCustomerRequest(
    $collectables: [CollectableInput!]!
    $address: ConnectBelongsTo!
    $collection_date: DateTime!
    $selectedGifts: [SelectedGiftInput!]
    $notes: String
    $additional_points: Float
  ) {
    createCustomerRequest(
      collectables: $collectables
      address: $address
      collection_date: $collection_date
      selectedGifts: $selectedGifts
      notes: $notes
      additional_points: $additional_points
    ) {
      id
      status
      type
      collection_date
      notes
      net_uco_quantity
      address {
        id
        latitude
        longitude
      }
      requestCollectables {
        collectable {
          id
        }
        measure {
          id
        }
        quantity
      }
    }
  }
`;

export const CREATE_INCOMPLETE_WEB_REQUEST = `
  mutation CreateIncompleteB2cWebRequest(
    $phone: String!
    $country_code: String
  ) {
    webFormCreateIncompleteRequest(
      phone: $phone
      country_code: $country_code
    ) {
      page
      recentlyCreated
      customer {
        id
        phone
        country_code
      }
      requests {
        id
        status
        type
      }
    }
  }
`;

export const UPDATE_B2C_WEB_REQUEST = `
  mutation UpdateB2cWebRequest(
    $id: ID!
    $status: UpdateRequestStatus
    $collectables: [CollectableInput!]
    $selectedGifts: [SelectedGiftInput!]
    $collection_date: Date
    $address: ConnectBelongsTo
    $additional_points: Float
  ) {
    webFormUpdateCustomerRequest(
      id: $id
      status: $status
      collectables: $collectables
      selectedGifts: $selectedGifts
      collection_date: $collection_date
      address: $address
      additional_points: $additional_points
    ) {
      id
      status
      type
      collection_date
      notes
      net_uco_quantity
      address {
        id
        latitude
        longitude
      }
      requestCollectables {
        collectable {
          id
        }
        measure {
          id
        }
        quantity
      }
    }
  }
`;
