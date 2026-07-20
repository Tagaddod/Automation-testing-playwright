export const runtimeConfig = {
  env: process.env.ENV || "staging",

  suite: process.env.SUITE || "Smoke",

  platform: process.env.PLATFORM || "B2B",

  //browser: process.env.BROWSER || 'chromium'
};
