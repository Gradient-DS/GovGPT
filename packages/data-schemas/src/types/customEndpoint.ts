import type { Document, Types } from 'mongoose';

export interface ICustomEndpoint extends Document {
  _id: Types.ObjectId;
  name: string;
  displayName?: string;
  description?: string;
  baseURL: string;
  apiKey?: string;
  headers?: Record<string, string>;
  models: string[];
  enabled: boolean;
  userProvide: boolean;
  iconURL?: string;
  openAPISpec?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TCustomEndpoint = Omit<ICustomEndpoint, keyof Document>;

export interface TCreateCustomEndpoint {
  name: string;
  displayName?: string;
  description?: string;
  baseURL: string;
  apiKey?: string;
  headers?: Record<string, string>;
  models?: string[];
  enabled?: boolean;
  userProvide?: boolean;
  iconURL?: string;
  openAPISpec?: string;
}

export interface TUpdateCustomEndpoint {
  name?: string;
  displayName?: string;
  description?: string;
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  models?: string[];
  enabled?: boolean;
  userProvide?: boolean;
  iconURL?: string;
  openAPISpec?: string;
} 