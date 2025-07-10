import React, { useState, useMemo } from 'react';
import { Globe, Plus, Settings, Trash2, ExternalLink, FileText, Database, AlertTriangle } from 'lucide-react';
import { EModelEndpoint } from 'librechat-data-provider';
import { SettingGroup } from '../shared';
import { Button } from '~/components/ui';
import { useGetEndpointsQuery } from '~/data-provider';
import { useGetCustomEndpointsQuery, useDeleteCustomEndpointMutation, useCreateCustomEndpointMutation } from '~/data-provider/Admin/queries';
import EndpointModal from './EndpointModal';

interface CustomEndpointsProps {
  adminConfig: any;
  onUpdateSetting: (key: string, value: any) => void;
  isSettingUpdating: (key: string) => boolean;
}

const CustomEndpoints: React.FC<CustomEndpointsProps> = ({
  adminConfig,
  onUpdateSetting,
  isSettingUpdating
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any | null>(null);
  
  // Get YAML endpoints from the main endpoints configuration
  const { data: endpointsConfig = {}, isLoading: endpointsLoading } = useGetEndpointsQuery();
  
  // Get database endpoints from admin panel  
  // Note: These hooks may fail if data-provider hasn't been rebuilt yet with the new API functions
  const { 
    data: databaseEndpoints = [], 
    isLoading: dbLoading, 
    error: dbError 
  } = useGetCustomEndpointsQuery();
  
  const deleteEndpointMutation = useDeleteCustomEndpointMutation();
  const createEndpointMutation = useCreateCustomEndpointMutation();

  const handleAddEndpoint = () => {
    setEditingEndpoint(null);
    setModalOpen(true);
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('Are you sure you want to delete this endpoint?')) {
      deleteEndpointMutation.mutate(id);
    }
  };

  // Extract YAML custom endpoints from the endpoints configuration
  const yamlEndpoints = useMemo(() => {
    const extractedEndpoints: any[] = [];
    
    if (!endpointsConfig) return extractedEndpoints;

    // Look for custom endpoints (these come from YAML configuration)
    Object.entries(endpointsConfig).forEach(([key, config]) => {
      // Skip standard endpoints like openAI, anthropic, etc.
      if (Object.values(EModelEndpoint).includes(key as EModelEndpoint)) {
        return;
      }
      
      const isDuplicate = (databaseEndpoints as any[]).some((d) => d.name === key);
      if (config && typeof config === 'object' && !isDuplicate) {
        extractedEndpoints.push({
          id: `yaml-${key}`,
          name: key,
          displayName: config.modelDisplayLabel || key,
          description: 'Configured via librechat.yaml',
          baseURL: 'Configured in YAML',
          enabled: true,
          models: [], // Models are loaded separately
          source: 'yaml',
          readonly: true,
          iconURL: config.iconURL,
          userProvide: config.userProvide,
        });
      }
    });

    return extractedEndpoints;
  }, [endpointsConfig, databaseEndpoints]);

  // Format database endpoints 
  const formattedDbEndpoints = useMemo(() => {
    if (!databaseEndpoints || !Array.isArray(databaseEndpoints)) {
      console.log('Database endpoints not array:', databaseEndpoints);
      return [];
    }
    return databaseEndpoints.map((endpoint: any) => ({
      ...endpoint,
      id: endpoint._id || endpoint.id,
      source: 'database',
      readonly: false,
    }));
  }, [databaseEndpoints]);

  // Combine all endpoints
  const allEndpoints = [...yamlEndpoints, ...formattedDbEndpoints];

  const openEditModal = (endpoint: any) => {
    setEditingEndpoint(endpoint);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEndpoint(null);
  };

  return (
    <SettingGroup
      id="customEndpoints"
      title="Custom Endpoints"
      icon={Globe}
      description="Manage custom AI endpoints via OpenAPI specifications"
    >
      <div className="space-y-6 py-6">
        {/* Error notice for missing API functions */}
        {dbError !== null && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Custom Endpoints API Not Available</h4>
                <p className="text-xs text-amber-700 mt-1">
                  The custom endpoints feature requires rebuilding the data-provider package. 
                  Run <code className="bg-amber-100 px-1 rounded">npm run build:data-provider</code> to enable this feature.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Manage custom AI endpoints from two sources: YAML configuration file and admin panel.
            </p>
            <p className="text-xs text-gray-500">
              YAML endpoints are defined in librechat.yaml and shown as read-only. Admin panel endpoints are stored in the database and fully manageable here.
            </p>
          </div>
          <Button 
            onClick={handleAddEndpoint} 
            className="flex items-center space-x-2"
            disabled={isSettingUpdating('customEndpoints')}
          >
            <Plus className="w-4 h-4" />
            <span>Add Database Endpoint</span>
          </Button>
        </div>

        {/* Loading State */}
        {(endpointsLoading || dbLoading) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading endpoints...</p>
          </div>
        )}

        {/* Endpoints List */}
        {!endpointsLoading && !dbLoading && allEndpoints.length > 0 ? (
          <div className="space-y-4">
            {allEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {endpoint.source === 'yaml' ? (
                        <FileText className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Database className="w-5 h-5 text-green-600" />
                      )}
                      <div className={`w-3 h-3 rounded-full ${endpoint.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{endpoint.displayName}</h3>
                        {endpoint.source === 'yaml' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>YAML Config</span>
                          </span>
                        )}
                        {endpoint.source === 'database' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center space-x-1">
                            <Database className="w-3 h-3" />
                            <span>Admin Panel</span>
                          </span>
                        )}
                        {endpoint.userProvide && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            User Key Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {endpoint.readonly ? (
                      <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded">
                        Read-only (Edit in librechat.yaml)
                      </span>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1" onClick={() => openEditModal(endpoint)}>
                          <Settings className="w-4 h-4" />
                          <span>Configure</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteEndpoint(endpoint.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteEndpointMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Base URL:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {endpoint.baseURL}
                      </code>
                      {endpoint.baseURL !== 'Configured in YAML' && (
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Models:</span>
                    <div className="mt-1">
                      {endpoint.models && endpoint.models.length > 0 ? (
                        <>
                          {endpoint.models.slice(0, 3).map((model: string) => (
                            <span key={model} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {model}
                            </span>
                          ))}
                          {endpoint.models.length > 3 && (
                            <span className="text-xs text-gray-500">+{endpoint.models.length - 3} more</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {endpoint.source === 'yaml' ? 'Loaded from configuration' : 'No models configured'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !endpointsLoading && !dbLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No custom endpoints configured yet.</p>
            <p className="text-sm">Add your first database endpoint or configure YAML endpoints in librechat.yaml.</p>
          </div>
        ) : null}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Endpoint Configuration</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>YAML Config (Blue):</strong> Endpoints defined in librechat.yaml - read-only here, edit the file directly</li>
            <li>• <strong>Admin Panel (Green):</strong> Database-stored endpoints created and managed via this interface</li>
            <li>• <strong>OpenAPI Support:</strong> Admin panel endpoints support OpenAPI 3.x and Swagger 2.x specifications</li>
            <li>• <strong>Auto-Discovery:</strong> Automatically extracts available models and endpoints from specifications</li>
            <li>• <strong>Security:</strong> All API keys are encrypted and stored securely in the database</li>
            <li>• <strong>Integration:</strong> Both types appear in the main endpoints menu when enabled</li>
          </ul>
        </div>

        <EndpointModal open={modalOpen} onClose={closeModal} endpoint={editingEndpoint} />
      </div>
    </SettingGroup>
  );
};

export default CustomEndpoints; 