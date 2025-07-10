import { Schema } from 'mongoose';
import type { ICustomEndpoint } from '~/types';

const customEndpointSchema: Schema<ICustomEndpoint> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    baseURL: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      default: '',
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    models: {
      type: [String],
      default: [],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    userProvide: {
      type: Boolean,
      default: false,
    },
    iconURL: {
      type: String,
      default: '',
    },
    openAPISpec: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'customendpoints',
  },
);

customEndpointSchema.index({ name: 1 });
customEndpointSchema.index({ enabled: 1 });

export default customEndpointSchema;

// Zod schemas for API validation
import { z } from 'zod';

export const customEndpointZodSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  baseURL: z.string().url('Must be a valid URL'),
  apiKey: z.string().optional(),
  headers: z.record(z.string()).optional(),
  models: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  userProvide: z.boolean().default(false),
  iconURL: z.string().url().optional(),
  openAPISpec: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createCustomEndpointSchema = customEndpointZodSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomEndpointSchema = customEndpointZodSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type TCustomEndpoint = z.infer<typeof customEndpointZodSchema>;
export type TCreateCustomEndpoint = z.infer<typeof createCustomEndpointSchema>;
export type TUpdateCustomEndpoint = z.infer<typeof updateCustomEndpointSchema>; 