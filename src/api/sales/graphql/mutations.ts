export const CREATE_BRANCH = `
  mutation CreateBranch(
    $business_client_id: ID!
    $branch_collectables: [BranchCollectableInput]!
    $latitude: String!
    $longitude: String!
    $phone: String!
    $payment_type: PaymentType!
    $country_code: String
  ) {
    createBranch(
      business_client_id: $business_client_id
      branch_collectables: $branch_collectables
      latitude: $latitude
      longitude: $longitude
      phone: $phone
      payment_type: $payment_type
      country_code: $country_code
    ) {
      id
      name
      identification_card
      phone
      address
      address_notes
      payment_type
      longitude
      latitude
      job_role
      manager_name
      sign_image
      status
      google_maps_id
      country_code
      is_seasonal
      preferred_time
    }
  }
`;

export const CREATE_TRADER_SUPER_APP = `
mutation CreateTraderSuperApp(
  $name: String!
  $phone: String!
  $vehicle_id: ID!
  $latitude: String!
  $longitude: String!
  $note: String!
  $collectable_id: ID!
  $country_code: String!
) {
  createTraderSuperApp(
    name: $name
    country_code: $country_code
    phone: $phone
    trader_type: X
    has_warehouse: true
    vehicle_id: $vehicle_id
    pickup_address: {
      latitude: $latitude
      longitude: $longitude
      note: $note
    }
    collectables: [$collectable_id]
  ) {
    id
    name
    phone
    country_code
  }
}
`;

export const CREATE_TRADER_REQUEST_SALES_AGENT = `
mutation CreateTraderRequestSalesAgent(
  $trader_id: ID!
  $collectable_id: ID!
  $measure_id: ID!
  $count: Float!
  $price: Float!
  $collection_date: DateTime!
) {
  createTraderRequestSalesAgent(
    trader_id: $trader_id
    collectables: [
      {
        id: $collectable_id
        measure_id: $measure_id
        price: $price
        count: $count
      }
    ]
    collection_date: $collection_date
  ) {
    id
    status
  }
}
`;

export const CREATE_BUSINESS_REQUEST_SUPER_APP = `
mutation CreateBusinessRequestSuperApp(
  $branch_id: ID!
  $collectable_id: ID!
  $measure_id: ID!
  $count: Float!
  $price: Float!
  $collection_date: DateTime!
  $collection_time: String!
) {
  createBusinessRequestSuperApp(
    branch_id: $branch_id
    collectables: {
      id: $collectable_id
      measure_id: $measure_id
      count: $count
      price: $price
    }
    date_time: {
      date: $collection_date
      time: $collection_time
    }
  ) {
    id
    status
    collection_date
    collection_time
    created_at
  }
}
`;

export const SIGN_CONTRACT_SUPER_APP = `
mutation SignContractSuperApp(
  $branch_id: ID!
  $signature: String!
) {
  signContractSuperApp(
    branch_id: $branch_id
    signature: $signature
  ) {
    id
    branch_id
    status
    signature_path
    signed_at
    effective_date
    expiry_date
    created_by
  }
}
`;

export const UPDATE_SALES_AGENT = `
  mutation UpdateSalesAgent($id: ID!, $locale: LocaleType) {
    updateSalesAgent(id: $id, locale: $locale) {
      id
      code
      name
      locale
      identification_card
      phone
      tasksCount
    }
  }
`;
