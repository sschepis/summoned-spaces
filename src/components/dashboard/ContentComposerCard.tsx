import { Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { ContentComposer } from '../ContentComposer';

export function ContentComposerCard() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Content Composer</h3>
      </div>
      <ContentComposer />
    </Card>
  );
}