export const GET_COLLECTOR_PROFILE = `
  query GetCollectorProfile {
    myCollector {
      id
      name
      phone
      country_code
      active
    }
  }
`;

export const GET_COLLECTOR_ACTIVE_TRIP = `
  query GetCollectorActiveTrip {
    getCollectorActiveTrip {
      id
      status
      collection_date
      type
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
  }
`;
