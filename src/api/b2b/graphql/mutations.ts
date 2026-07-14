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

export const CREATE_BRANCH = `
  mutation CreateBranch(
    $business_client_id: ID!
    $branch_collectables: BranchCollectableInput!
    $latitude: String!
    $longitude: String!
    $phone: String!
    $payment_type: PaymentType!
  ) {
    createBranch(
      business_client_id: $business_client_id
      branch_collectables: $branch_collectables
      latitude: $latitude
      longitude: $longitude
      phone: $phone
      payment_type: $payment_type
    ) {
      id
      name
      phone
      payment_type
      latitude
      longitude
      status
    }
  }
`;
