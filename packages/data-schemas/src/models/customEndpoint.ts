import customEndpointSchema from '~/schema/customEndpoint';
import type { ICustomEndpoint } from '~/types';

/**
 * Creates or returns the CustomEndpoint model using the provided mongoose instance and schema
 */
export function createCustomEndpointModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.CustomEndpoint || mongoose.model<ICustomEndpoint>('CustomEndpoint', customEndpointSchema);
} 