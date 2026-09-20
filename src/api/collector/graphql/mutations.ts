export const START_TRIP = `
  mutation StartTrip($tripId: ID!) {
    startTrip(trip_id: $tripId) {
      id
      status
    }
  }
`;

export const UPDATE_REQUEST_CART = `
  mutation UpdateRequestCart(
    $requestId: ID!
    $requestCollectables: [RequestCollectableInput!]!
  ) {
    updateRequestCart(
      request_id: $requestId
      request_collectables: $requestCollectables
    )
  }
`;

export const UPDATE_REQUEST_COMPENSATION = `
  mutation UpdateRequestCompensation(
    $requestId: ID!
    $selectedGifts: [SelectedGiftInput!]
  ) {
    updateRequestCompensation(
      request_id: $requestId
      selectedGifts: $selectedGifts
    )
  }
`;

export const UPDATE_REQUEST_STATUS = `
  mutation UpdateRequestStatus($requestId: ID!, $status: UpdateRequestStatus!) {
    updateRequestStatus(request_id: $requestId, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_COLLECTOR = `
  mutation UpdateCollector($requestId: ID!) {
    updateCollector(
      id: 916
      input: {
        requests: {
          update: [
            {
              id: $requestId
              status: FULFILLED
              collector_tracking: {
                device_id: "QKQ1.191224.003"
              }
            }
          ]
        }
      }
    ) {
      id
      name
      identification_card
      phone
      country_code
      locale
      active
      access_multiple_requests
      collector_node_id
      can_manage_trips
    }
  }
`;

export const END_COLLECTOR_TRIP = `
  mutation EndCollectorTrip($tripId: ID!) {
    endCollectorTrip(
      trip_id: $tripId
      latitude: "30.0444"
      longitude: "31.2357"
    ) {
      id
      status
      distance
      duration
      type
      collection_date
      total_uco
      created_at
      total_requests
      funnels
      containers
      scale_amount_difference
      total_received_oil_amount
      total_collected_cash
      total_cash
      channel_types
      quality_status
    }
  }
`;
