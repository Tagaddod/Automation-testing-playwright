export const GET_COLLECTABLES = `
  query GetCollectables($channels: [Channel!]!) {
    getCollectables(channels: $channels) {
      id
      name
    }
  }
`;
