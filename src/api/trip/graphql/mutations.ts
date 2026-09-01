export const CREATE_TRIP = `
  mutation CreateTrip(
    $warehouse_type_id: ID!
    $warehouse_id: ID!
    $collector_id: ID
    $collection_date: DateTime!
    $requests_ids: [ID!]!
  ) {
    createTripTest(
      warehouse_type_id: $warehouse_type_id
      warehouse_id: $warehouse_id
      collector_id: $collector_id
      collection_date: $collection_date
      requests_ids: $requests_ids
    ) {
      id
      status
      collection_date
      type
      total_requests
      collector {
        id
        name
      }
      warehouse {
        id
        name
      }
      warehouseType {
        id
        name
      }
      requests {
        id
        status
        type
        collection_date
      }
    }
  }
`;

export const START_TRIP = `
  mutation StartTrip($trip_id: ID!) {
    startTrip(trip_id: $trip_id) {
      id
      status
      collection_date
      collector {
        id
      }
      requests {
        id
        status
        type
      }
    }
  }
`;
