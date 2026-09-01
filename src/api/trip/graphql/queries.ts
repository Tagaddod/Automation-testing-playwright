export const GET_TRIP = `
  query GetTrip($id: ID!) {
    warehouse_trip(id: $id) {
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
