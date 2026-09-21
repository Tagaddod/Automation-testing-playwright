export const CREATE_TRIP_LOAD = `
  mutation CreateTripLoad($tripId: ID!, $channelType: ChannelTypeEnum!) {
    createTripLoad(trip_id: $tripId, channel_type: $channelType) {
      id
      trip_id
      load_step
      status
      net_weight
      created_at
    }
  }
`;

export const DELETE_TRIP_LOAD = `
  mutation DeleteTripLoad($trip_load_id: ID!) {
    deleteTripLoad(trip_load_id: $trip_load_id)
  }
`;

export const SET_FIRST_SCALE = `
  mutation SetFirstScale($tripLoadId: ID!, $firstScaleAmount: Float!) {
    setFirstScale(trip_load_id: $tripLoadId, first_scale_amount: $firstScaleAmount) {
      id
      trip_id
      trip_load_id
      first_scale_amount
      first_scale_time
      is_pre_trip_scale
      tripLoad {
        id
        status
      }
    }
  }
`;

export const SET_SECOND_SCALE = `
  mutation SetSecondScale($firstScaleId: ID!, $secondScaleAmount: Float!) {
    setSecondScale(first_scale_id: $firstScaleId, second_scale_amount: $secondScaleAmount) {
      id
      first_scale_amount
      second_scale_amount
      second_scale_time
      scale_amount_difference
      tripLoad {
        id
        status
        net_weight
      }
    }
  }
`;

export const SET_THIRD_SCALE = `
  mutation SetThirdScale($firstScaleId: ID!, $notes: String, $deductibles: Float) {
    setThirdScaleDeductibles(
      first_scale_id: $firstScaleId
      notes: $notes
      third_scale_deductibles_amount: $deductibles
    ) {
      id
      first_scale_amount
      second_scale_amount
      third_scale_deductibles_amount
      third_scale_time
      scale_amount_difference
      notes
      tripLoad {
        id
        status
        net_weight
      }
    }
  }
`;

export const ADD_TRIP_LOAD_QUALITY = `
  mutation AddTripLoadQuality($input: AddTripLoadQualityInput!) {
    addTripLoadQuality(input: $input) {
      id
      trip_load_id
      status
      channel_type
      ffa
      i
      m
      s
      cl
      p
      unsaponifiable
      empty_beaker_weight
      beaker_sample_before
      beaker_sample_after
      beaker_sediments
      koh_volume
      product_type
      inspection_time
      inspector_name
      trip_load {
        id
        load_step
        status
        net_weight
      }
    }
  }
`;

export const UPDATE_QUALITY_OPTIONAL_FIELDS = `
  mutation UpdateQualityOptionalFields($input: UpdateTripLoadQualityOptionalFieldsInput!) {
    updateQualityOptionalFields(input: $input) {
      id
      trip_load_id
      status
      channel_type
      ffa
      i
      m
      s
      cl
      p
      unsaponifiable
      empty_beaker_weight
      beaker_sample_before
      beaker_sample_after
      beaker_sediments
      koh_volume
      product_type
      inspection_time
      inspector_name
    }
  }
`;

export const GENERATE_SAMPLE_CODE = `
  mutation GenerateSampleCode($tripLoadId: ID!) {
    generateSampleConfirmationCode(trip_load_id: $tripLoadId) {
      id
      sample_confirmation_code
      sample_taken_by_user {
        id
        name
      }
      sample_taken_time
    }
  }
`;

export const DELETE_SAMPLE_CONFIRMATION = `
  mutation DeleteSampleConfirmation($tripLoadId: ID!) {
    deleteSampleConfirmation(trip_load_id: $tripLoadId) {
      id
      sample_confirmation_code
      sample_taken_by_user {
        id
        name
      }
      sample_taken_time
    }
  }
`;

export const VERIFY_SAMPLE_CODE = `
  mutation VerifySampleCode($tripLoadId: ID!, $code: String!) {
    verifySampleConfirmationCode(trip_load_id: $tripLoadId, code: $code) {
      id
      sample_confirmation_code
      sample_received_by_user {
        id
        name
      }
      sample_received_time
    }
  }
`;

/** Middle mile — create trip. Pass shippingDate as YYYY-MM-DD (use system date from builders). */
export const CREATE_MIDDLE_MILE_TRIP = `
  mutation CreateMiddleMileTrip($input: CreateMiddleMileTripInput!) {
    createMiddleMileTrip(input: $input) {
      id
      status
      truck_type
      shipping_date
      notes
      creator {
        id
        name
      }
      source_warehouse {
        id
        name
      }
      destination_warehouse {
        id
        name
      }
      collectable {
        id
        name_en
        name_ar
      }
      items {
        id
        channel_type
        quantity
      }
      created_at
    }
  }
`;

export const START_MIDDLE_MILE_SENDING = `
  mutation StartMiddleMileSending($middleMileTripId: ID!) {
    startMiddleMileSending(middle_mile_trip_id: $middleMileTripId) {
      id
      status
      items {
        id
        channel_type
        quantity
      }
      trip_loads {
        id
        channel_type
        load_step
        status
        direction
        net_weight
      }
    }
  }
`;

export const CONFIRM_MIDDLE_MILE_SENDING_LOAD = `
  mutation ConfirmMiddleMileSendingLoad($input: ConfirmMiddleMileSendingLoadInput!) {
    confirmMiddleMileSendingLoad(input: $input) {
      id
      status
      trip_loads {
        id
        status
        direction
        net_weight
      }
    }
  }
`;

export const CONFIRM_MIDDLE_MILE_SENDING = `
  mutation ConfirmMiddleMileSending($middleMileTripId: ID!) {
    confirmMiddleMileSending(middle_mile_trip_id: $middleMileTripId) {
      id
      status
      sender_confirmed_at
      trip_loads {
        id
        status
        direction
        net_weight
      }
    }
  }
`;

export const START_MIDDLE_MILE_RECEIVING = `
  mutation StartMiddleMileReceiving($middleMileTripId: ID!) {
    startMiddleMileReceiving(middle_mile_trip_id: $middleMileTripId) {
      id
      status
      trip_loads {
        id
        status
        direction
        net_weight
      }
    }
  }
`;

export const ADD_MIDDLE_MILE_RECEIVING_LOAD = `
  mutation AddMiddleMileReceivingLoad($input: AddMiddleMileReceivingLoadInput!) {
    addMiddleMileReceivingLoad(input: $input) {
      id
      status
      trip_loads {
        id
        channel_type
        direction
        net_weight
        has_scrape
      }
    }
  }
`;

export const CONFIRM_MIDDLE_MILE_RECEIVING_LOAD = `
  mutation ConfirmMiddleMileReceivingLoad($input: ConfirmMiddleMileReceivingLoadInput!) {
    confirmMiddleMileReceivingLoad(input: $input) {
      id
      status
      trip_loads {
        id
        status
        direction
        net_weight
        has_scrape
      }
    }
  }
`;

export const CONFIRM_MIDDLE_MILE_RECEIVING = `
  mutation ConfirmMiddleMileReceiving($middleMileTripId: ID!) {
    confirmMiddleMileReceiving(middle_mile_trip_id: $middleMileTripId) {
      id
      status
      trip_loads {
        id
        status
        direction
        net_weight
      }
    }
  }
`;
