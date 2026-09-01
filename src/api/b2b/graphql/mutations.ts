export const CREATE_BUSINESS_CLIENT = `
  mutation CreateBusinessClientB2bForm(
    $business_client_ar_name: String!
    $business_client_en_name: String!
    $brand_type_id: ID!
  ) {
    createBusinessClientB2bForm(
      business_client_ar_name: $business_client_ar_name
      business_client_en_name: $business_client_en_name
      brand_type_id: $brand_type_id
    ) {
      id
      name
      status
      brandType {
        id
        name
      }
    }
  }
`;

export const CREATE_BUSINESS_REQUEST_V2 = `
  mutation CreateBusinessRequestB2bFormV2(
    $branch_id: ID!
    $collectables: [CollectableInput!]
    $fresh_products: [FreshProductInput]
    $day_const: String
    $date_time: DateTimeObject
    $notes: String
  ) {
    createBusinessRequestB2bFormV2(
      branch_id: $branch_id
      collectables: $collectables
      fresh_products: $fresh_products
      day_const: $day_const
      date_time: $date_time
      notes: $notes
    ) {
      id
      status
      collection_date
      notes
      net_uco_quantity
      created_at
      collection_time
      currency
      compensation
      selling_total
      net_compensation
      flow_type
      requestFreshProducts {
        id
        quantity
        freshProduct {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_BRANCH = `
  mutation CreateBranchB2bForm(
    $business_client_id: ID!
    $branch_collectables: [BranchCollectableInput!]!
    $latitude: String!
    $longitude: String!
    $phone: String!
    $payment_type: PaymentType!
    $sell_fresh_products: Boolean!
  ) {
    createBranchB2bForm(
      business_client_id: $business_client_id
      branch_collectables: $branch_collectables
      latitude: $latitude
      longitude: $longitude
      phone: $phone
      payment_type: $payment_type
      sell_fresh_products: $sell_fresh_products
    ) {
      id
      name
      phone
      payment_type
      latitude
      longitude
      status
      sell_fresh_products
    }
  }
`;
