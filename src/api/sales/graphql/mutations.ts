export const CREATE_BRANCH = `
  mutation CreateBranch(
    $business_client_id: ID!
    $branch_collectables: [BranchCollectableInput]!
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
