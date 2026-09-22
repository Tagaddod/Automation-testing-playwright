export const GET_COLLECTOR_ACTIVE_TRIP = `
  query GetCollectorActiveTrip {
    getCollectorActiveTrip {
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
      requests {
        id
        type
        status
        requestCollectables {
          id
          collectable {
            id
            name
            flow
            is_primary
          }
          measure {
            id
            name
            unit
            image
            quantity_step
          }
          quantity
          cash
          points
        }
      }
    }
  }
`;

export const GET_REQUEST_AVAILABLE_COLLECTABLES = `
  query GetRequestAvailableCollectables($requestId: ID!) {
    getRequestAvailableCollectables(request_id: $requestId) {
      id
      name
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
    }
  }
`;

export const GET_REQUEST_COMPENSATIONS = `
  query GetRequestCompensations($requestId: ID!) {
    getRequestCompensations(request_id: $requestId) {
      request_points
      total_points
      cash
      available_gifts {
        campaign {
          id
          points
        }
      }
    }
  }
`;
