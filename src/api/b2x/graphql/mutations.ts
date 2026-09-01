export const CREATE_TRADER_REQUEST_V2 = `
  mutation CreateTraderRequestV2(
    $trader_id: ID!
    $collectables: [CollectableInput!]!
    $collection_date: DateTime!
    $notes: String
  ) {
    createTraderRequestV2(
      trader_id: $trader_id
      collectables: $collectables
      collection_date: $collection_date
      notes: $notes
    ) {
      id
      status
      localized_status
      collection_date
      notes
      net_uco_quantity
      created_at
      rated_by_collector
      rated_by_customer
      points
      funnels
      containers
      compensation
      max_price
      manual_invoice_image
      extra_points
      request_points
      reward_type
      reward_value
      collector_notes
      order
      invoice
      collection_time
      container_type
      price_per_kilo
      branch_price
      ffa
      mai
      collection_type
      currency
      delivery_fees
      consumed_points
      verification_code
      selling_total
      net_compensation
      flow_type
      service_contract_id
    }
  }
`;

export const CREATE_TRADER = `
  mutation CreateTrader(
    $name: String!
    $country_code: String!
    $phone: String!
    $trader_type: TraderType!
    $has_warehouse: Boolean!
    $vehicle_id: ID!
    $latitude: String!
    $longitude: String!
  ) {
    createTrader(
      name: $name
      country_code: $country_code
      phone: $phone
      trader_type: $trader_type
      has_warehouse: $has_warehouse
      vehicle_id: $vehicle_id
      pickup_address: { latitude: $latitude, longitude: $longitude }
      collectables: ["1"]
    ) {
      id
      name
      phone
      country_code
    }
  }
`;
