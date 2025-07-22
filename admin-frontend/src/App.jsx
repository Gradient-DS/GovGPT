import { useEffect, useState } from 'react';

export default function App() {
  const [welcome, setWelcome] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((data) => {
        setWelcome(data.overrides?.interface?.customWelcome || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'interface.customWelcome', value: welcome }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert('✅ Saved to database! Use "Apply & Restart" to see changes.');
    } catch (e) {
      alert('❌ Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyRestart = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/apply', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      alert('✅ Configuration applied! \n\n🔄 Please restart LibreChat to see changes.\n\nFor best results, use: npm run start-dev (from packages/librechat-admin)');
    } catch (e) {
      alert('❌ Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>GovGPT Admin – Custom Welcome</h1>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #0369a1', borderRadius: '0.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>Quick Start Workflow:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Start LibreChat with admin config:</strong><br/>
              <code style={{ backgroundColor: '#e0f2fe', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
                cd packages/librechat-admin && npm run start-dev
              </code>
          </li>
          <li>Edit the welcome message below</li>
          <li>Click "Save" to store in database</li>
          <li>Click "Apply & Restart" to generate merged config</li>
          <li>Restart LibreChat to see changes</li>
        </ol>
      </div>

      <textarea
        style={{ width: '100%', height: 120, marginBottom: '1rem' }}
        value={welcome}
        onChange={(e) => setWelcome(e.target.value)}
        placeholder="Enter your custom welcome message..."
      />
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.25rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save to Database'}
        </button>
        
        <button
          onClick={handleApplyRestart}
          disabled={saving}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.25rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Applying...' : 'Apply & Restart'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Alternative Methods:</h4>
        <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Manual config generation:</strong><br/>
            <code style={{ backgroundColor: '#fef7cd', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
              node packages/librechat-admin/scripts/dev-reload.js
            </code>
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Start with pre-generated config:</strong><br/>
            <code style={{ backgroundColor: '#fef7cd', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
              CONFIG_PATH=librechat.merged.yaml npm run backend:dev
            </code>
          </p>
        </div>
      </div>
    </div>
  );
} 