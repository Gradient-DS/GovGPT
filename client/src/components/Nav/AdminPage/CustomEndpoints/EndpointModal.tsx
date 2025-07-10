import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/Dialog';
import { Button, Input, Switch } from '~/components/ui';
import {
  useCreateCustomEndpointMutation,
  useUpdateCustomEndpointMutation,
} from '~/data-provider/Admin/queries';

interface EndpointModalProps {
  open: boolean;
  onClose: () => void;
  endpoint?: any | null; // existing endpoint if edit
}

const EndpointModal: React.FC<EndpointModalProps> = ({ open, onClose, endpoint }) => {
  const isEdit = !!endpoint;
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
    baseURL: '',
    apiKey: '',
    iconURL: '',
    models: '', // comma-separated string for user input
    enabled: true,
  });

  useEffect(() => {
    if (endpoint) {
      setForm({
        name: endpoint.name || '',
        displayName: endpoint.displayName || '',
        description: endpoint.description || '',
        baseURL: endpoint.baseURL || '',
        apiKey: endpoint.apiKey || '',
        iconURL: endpoint.iconURL || '',
        models: Array.isArray(endpoint.models) ? endpoint.models.join(', ') : '',
        enabled: endpoint.enabled !== false,
      });
    } else {
      setForm({
        name: '',
        displayName: '',
        description: '',
        baseURL: '',
        apiKey: '',
        iconURL: '',
        models: '',
        enabled: true,
      });
    }
  }, [endpoint]);

  const createMutation = useCreateCustomEndpointMutation();
  const updateMutation = useUpdateCustomEndpointMutation();

  const modelsArray = React.useMemo(
    () =>
      form.models
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m),
    [form.models],
  );

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload: any = {
      ...form,
      models: modelsArray,
      iconURL: form.iconURL,
    };
    if (isEdit) {
      updateMutation.mutate({ id: endpoint.id || endpoint._id, data: payload }, {
        onSuccess: onClose,
      });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const isSaveDisabled = !form.name || !form.displayName || modelsArray.length === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg px-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Custom Endpoint' : 'Add Custom Endpoint'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Name (unique key)"
            value={form.name}
            disabled={isEdit}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <Input
            placeholder="Display Name"
            value={form.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <Input
            placeholder="Base URL"
            value={form.baseURL}
            onChange={(e) => handleChange('baseURL', e.target.value)}
          />
          <Input
            placeholder="API Key"
            type="password"
            value={form.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
          />
          <Input
            placeholder="Icon URL (optional)"
            value={form.iconURL}
            onChange={(e) => handleChange('iconURL', e.target.value)}
          />
          <Input
            placeholder="Models (comma separated)"
            value={form.models}
            onChange={(e) => handleChange('models', e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="text-sm">Enabled</label>
            <Switch checked={form.enabled} onCheckedChange={(v) => handleChange('enabled', v)} />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled || createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EndpointModal; 