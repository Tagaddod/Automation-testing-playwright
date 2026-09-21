export const GET_COLLECTABLES = `
  query GetCollectables($channels: [Channel!]!) {
    getCollectables(channels: $channels) {
      id
      name
    }
  }
`;

export const MY_SALES_AGENT = `
  query MySalesAgent {
    mySalesAgent {
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

export const SALES_AGENT_LATEST_VERSION = `
  query SalesAgentLatestVersion {
    salesAgentLatestVersion {
      id
      type
      version
      minimum_supported_version
    }
  }
`;

export const GET_SELLER_COLLECTABLES_SALES_AGENT = `
  query GetSellerCollectablesSalesAgent($trader_id: ID) {
    getSellerCollectablesSalesAgent(trader_id: $trader_id) {
      id
      name_ar
      name_en
      name_de
      image
      flow
      is_primary
      total_count
      remaining_count
      consumed_count
    }
  }
`;

export const GET_REQUESTS_TIME_SLOTS = `
  query GetRequestsTimeSlots {
    getRequestsTimeSlots {
      range
      period
      time
    }
  }
`;

/** Vienna / AT recurring request summary + available time slots (Postman combined query). */
export const GET_RECURRING_REQUEST_SUMMARY = `
  query GetRecurringRequestSummary(
    $country_code: String!
    $start_date: Date!
    $end_date: Date
    $collection_frequency: RecurringCollectionFrequencyEnum!
    $frequency_day: Int
    $collection_time: String!
  ) {
    getRecurringRequestSummary(
      country_code: $country_code
      start_date: $start_date
      end_date: $end_date
      collection_frequency: $collection_frequency
      frequency_day: $frequency_day
      collection_time: $collection_time
    ) {
      next_collection_date
    }
    getTimeSlots {
      range
      period
      time
    }
  }
`;
