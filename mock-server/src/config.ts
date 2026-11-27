export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
  ACCESS_TOKEN_LIFETIME: parseInt(process.env.ACCESS_TOKEN_LIFETIME || '60', 10),
  REFRESH_TOKEN_LIFETIME: parseInt(process.env.REFRESH_TOKEN_LIFETIME || '600', 10),
  API_DELAY_MIN: parseInt(process.env.API_DELAY_MIN || '300', 10),
  API_DELAY_MAX: parseInt(process.env.API_DELAY_MAX || '800', 10),
};
