export const MIN_PASSWORD_LENGTH = parseInt(process.env.MIN_PASSWORD_LENGTH || "5");
export const MAX_PASSWORD_LENGTH = parseInt(process.env.MAX_PASSWORD_LENGTH || "30");
export const SALT_FACTOR = parseInt(process.env.SALT_FACTOR || "15");
export const MIN_ORG_NAME_LENGTH = parseInt(process.env.MIN_ORG_NAME_LENGTH || "5");
export const MAX_ORG_NAME_LENGTH = parseInt(process.env.MAX_ORG_NAME_LENGTH || "30");
export const MAX_ORG_DESC_LENGTH = parseInt(process.env.MAX_ORG_DESC_LENGTH || "200");