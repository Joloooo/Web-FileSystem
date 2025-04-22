import * as Joi from 'joi';

// used to ensure that env file types are correctly configured and not missing if 
//not same type of in env it will throw error when app starts

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(8000),
  ALLOWED_ORIGIN: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  S3_ENDPOINT: Joi.string().uri().required(),
  S3_BUCKET_NAME: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
}).unknown(true);;
