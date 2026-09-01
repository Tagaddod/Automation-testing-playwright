export const VALIDATE_COLLECTION_LOCATION = `
  mutation ValidateCollectionLocation(
    $request_id: ID!
    $latitude: String!
    $longitude: String!
  ) {
    validateCollectionLocation(
      request_id: $request_id
      latitude: $latitude
      longitude: $longitude
    )
  }
`;

export const UPDATE_REQUEST_CART = `
  mutation UpdateRequestCart(
    $request_id: ID!
    $request_collectables: [RequestCollectableInput!]
    $fresh_products: [FreshProductInput!]
  ) {
    updateRequestCart(
      request_id: $request_id
      request_collectables: $request_collectables
      fresh_products: $fresh_products
    )
  }
`;

export const UPDATE_REQUEST_COMPENSATION = `
  mutation UpdateRequestCompensation(
    $request_id: ID!
    $selectedGifts: [SelectedGiftInput!]
  ) {
    updateRequestCompensation(
      request_id: $request_id
      selectedGifts: $selectedGifts
    )
  }
`;

export const UPDATE_REQUEST_STATUS = `
  mutation UpdateRequestStatus(
    $request_id: ID!
    $status: UpdateRequestStatus!
  ) {
    updateRequestStatus(request_id: $request_id, status: $status) {
      id
      status
      type
      collection_date
      net_uco_quantity
    }
  }
`;

export const END_COLLECTOR_TRIP = `
  mutation EndCollectorTrip(
    $trip_id: ID!
    $latitude: String!
    $longitude: String!
  ) {
    endCollectorTrip(
      trip_id: $trip_id
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      status
      collection_date
      requests {
        id
        status
        type
      }
    }
  }
`;
