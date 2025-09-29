import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { SettingsSection } from '../common/forms/SettingsSection';
import { Button } from '../ui/Button';
import { Alert } from '../ui/feedback/Alert';

export function DangerZoneTab() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const isDeleteDisabled = deleteInput !== 'DELETE MY ACCOUNT';

  return (
    <SettingsSection
      title="Account Management"
      description="Manage your account and data with caution."
    >
      <div className="space-y-4">
        <Alert variant="warning">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-300 mb-2">Clear Resonance Cache</h4>
              <p className="text-sm text-gray-400 mb-4">
                Clear all cached resonance data. This will slow down future summons but free up space.
              </p>
              <Button variant="secondary" className="bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30">
                Clear Cache
              </Button>
            </div>
          </div>
        </Alert>

        <Alert variant="error">
          <div className="flex items-start space-x-3">
            <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-300 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Alert>

        {showDeleteConfirm && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="font-medium text-red-300 mb-2">Are you absolutely sure?</h4>
            <p className="text-sm text-gray-400 mb-4">
              Type <strong>DELETE MY ACCOUNT</strong> to confirm permanent deletion.
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE MY ACCOUNT"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={isDeleteDisabled}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}