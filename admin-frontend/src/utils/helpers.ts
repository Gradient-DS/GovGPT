/**
 * Gets a nested property value from an object using dot notation
 */
export function getNested(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}

/**
 * Creates a values map from settings groups and overrides object
 */
export function createValuesMap(overrides: any, settingGroups: any[]): Record<string, unknown> {
  if (!overrides) return {};
  
  const map: Record<string, unknown> = {};
  for (const group of settingGroups) {
    for (const setting of group.settings) {
      map[setting.key] = getNested(overrides, setting.key);
    }
  }
  return map;
} 