import { Download, Upload } from 'lucide-react';
import { SettingsSection } from '../common/forms/SettingsSection';
import { Button } from '../ui/Button';

export function DataSettingsTab() {
  return (
    <SettingsSection
      title="Data Management"
      description="Manage your account data and storage."
    >
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Export Your Data</h4>
              <p className="text-sm text-gray-400">Download all your spaces, files, and resonance data</p>
            </div>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Import Data</h4>
              <p className="text-sm text-gray-400">Import spaces and files from other platforms</p>
            </div>
            <Button variant="secondary" icon={Upload}>
              Import
            </Button>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-2">Storage Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Files contributed:</span>
              <span className="text-white">2.4 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Resonance cache:</span>
              <span className="text-white">156 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Total used:</span>
              <span className="text-cyan-400 font-medium">2.56 GB of 10 GB</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" 
                     style={{ width: '25.6%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}