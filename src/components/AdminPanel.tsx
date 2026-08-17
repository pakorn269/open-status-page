import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Plus, Trash2, Edit2, CheckCircle2, Key, RefreshCw, X, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

interface IncidentRow {
  id: string;
  name: string;
  message: string;
  impact: 'none' | 'minor' | 'major' | 'critical';
  created_at: string;
  resolved_at: string | null;
}

interface AdminPanelProps {
  onIncidentChange: () => void;
  supabaseUrl: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onIncidentChange, supabaseUrl }) => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return localStorage.getItem('statuspage_admin_key') || '';
  });
  const [inputKey, setInputKey] = useState<string>('');

  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const [formImpact, setFormImpact] = useState<'none' | 'minor' | 'major' | 'critical'>('minor');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getAdminClient = (keyToUse = adminKey) => {
    return createClient(supabaseUrl, keyToUse);
  };

  const fetchAdminIncidents = async (keyToUse = adminKey) => {
    if (!keyToUse) return;
    setLoading(true);
    setError(null);
    try {
      const client = getAdminClient(keyToUse);
      const { data, error: fetchErr } = await client
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setIncidents(data || []);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      setError(err.message || 'Failed to authenticate with the provided key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchAdminIncidents(adminKey);
    }
  }, [adminKey]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setAdminKey(inputKey.trim());
    localStorage.setItem('statuspage_admin_key', inputKey.trim());
    setInputKey('');
  };

  const handleClearKey = () => {
    localStorage.removeItem('statuspage_admin_key');
    setAdminKey('');
    setIncidents([]);
    setError(null);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormName('');
    setFormMessage('');
    setFormImpact('minor');
    setIsResolved(false);
    setIsFormOpen(true);
  };

  const openEditForm = (inc: IncidentRow) => {
    setEditingId(inc.id);
    setFormName(inc.name);
    setFormMessage(inc.message);
    setFormImpact(inc.impact);
    setIsResolved(!!inc.resolved_at);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) {
      setError('Please fill in both the title and the message.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const client = getAdminClient();

      if (editingId) {
        // Update existing
        const { error: updateErr } = await client
          .from('incidents')
          .update({
            name: formName.trim(),
            message: formMessage.trim(),
            impact: formImpact,
            resolved_at: isResolved ? new Date().toISOString() : null,
          })
          .eq('id', editingId);

        if (updateErr) throw updateErr;
        setSuccessMsg('Incident updated successfully.');
      } else {
        // Create new
        const { error: insertErr } = await client
          .from('incidents')
          .insert([
            {
              name: formName.trim(),
              message: formMessage.trim(),
              impact: formImpact,
              resolved_at: isResolved ? new Date().toISOString() : null,
            },
          ]);

        if (insertErr) throw insertErr;
        setSuccessMsg('New incident posted successfully.');
      }

      setIsFormOpen(false);
      await fetchAdminIncidents();
      onIncidentChange();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Operation failed. Check if your Service Role Key has write permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickResolve = async (inc: IncidentRow) => {
    if (!window.confirm(`Mark "${inc.name}" as resolved?`)) return;

    setError(null);
    try {
      const client = getAdminClient();
      const { error: resolveErr } = await client
        .from('incidents')
        .update({
          resolved_at: new Date().toISOString(),
          message: `${inc.message} — This incident has been resolved.`,
        })
        .eq('id', inc.id);

      if (resolveErr) throw resolveErr;
      setSuccessMsg(`Incident "${inc.name}" marked as resolved.`);
      await fetchAdminIncidents();
      onIncidentChange();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve incident.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setError(null);
    try {
      const client = getAdminClient();
      const { error: deleteErr } = await client
        .from('incidents')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;
      setSuccessMsg(`Incident "${name}" deleted.`);
      await fetchAdminIncidents();
      onIncidentChange();
    } catch (err: any) {
      setError(err.message || 'Failed to delete incident.');
    }
  };

  const getImpactBadge = (impact: IncidentRow['impact']) => {
    switch (impact) {
      case 'none':     return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'minor':    return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900';
      case 'major':    return 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900';
      case 'critical': return 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900';
    }
  };

  // If no admin key set, show authentication gate
  if (!adminKey) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Incident Management</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Authenticate with your Supabase Service Role Key to manage incidents.</p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Supabase Service Role Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Key size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
              Found in: Supabase Dashboard → Project Settings → API → `service_role` secret.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold py-2.5 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Incident Administration</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Post status updates, manage active outages, and record resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={openCreateForm}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Post New Incident
          </button>

          <button
            onClick={() => fetchAdminIncidents()}
            disabled={loading}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Refresh list"
            aria-label="Refresh incidents list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleClearKey}
            className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900 px-3 py-2 rounded-md transition-colors cursor-pointer"
            title="Log out from admin"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-md flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 text-xs p-3.5 rounded-md flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/60 rounded-lg p-6 shadow-md transition-all">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
              {editingId ? 'Edit Incident' : 'Post New Incident'}
            </h4>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Incident Title
              </label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Elevated latency on gateway.9arm.co"
                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Impact Level
                </label>
                <select
                  value={formImpact}
                  onChange={e => setFormImpact(e.target.value as any)}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="none">None / Informational</option>
                  <option value="minor">Minor (Yellow)</option>
                  <option value="major">Major (Orange)</option>
                  <option value="critical">Critical (Red)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isResolved}
                    onChange={e => setIsResolved(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mark as Resolved</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status Message / Update
              </label>
              <textarea
                value={formMessage}
                onChange={e => setFormMessage(e.target.value)}
                placeholder="Describe what happened, current investigations, or the resolution details..."
                rows={3}
                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Incident' : 'Publish Incident'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents Table / List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Recorded Incidents ({incidents.length})
          </span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
            No incidents found in database. Click "Post New Incident" to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {incidents.map(inc => (
              <div key={inc.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {inc.name}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getImpactBadge(inc.impact)}`}>
                      {inc.impact}
                    </span>
                    {inc.resolved_at ? (
                      <span className="text-[10px] font-medium bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 px-2 py-0.5 rounded">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {inc.message}
                  </p>

                  <div className="text-[11px] text-gray-400 dark:text-gray-500 flex gap-3 flex-wrap">
                    <span>Created: {dayjs(inc.created_at).format('MMM D, YYYY HH:mm')}</span>
                    {inc.resolved_at && (
                      <span>Resolved: {dayjs(inc.resolved_at).format('MMM D, YYYY HH:mm')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {!inc.resolved_at && (
                    <button
                      onClick={() => handleQuickResolve(inc)}
                      className="text-xs text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/60 border border-green-200 dark:border-green-900 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      title="Resolve Incident"
                    >
                      <CheckCircle2 size={13} />
                      Resolve
                    </button>
                  )}

                  <button
                    onClick={() => openEditForm(inc)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
                    title="Edit Incident"
                    aria-label="Edit Incident"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(inc.id, inc.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                    title="Delete Incident"
                    aria-label="Delete Incident"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
