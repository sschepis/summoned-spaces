import { Zap, MessageCircle, Search, Globe, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickActionsCardProps {
  onOpenDirectMessages: () => void;
  onOpenSearch: () => void;
  onCreateSpace: () => void;
  onOpenSettings: () => void;
}

export function QuickActionsCard({ 
  onOpenDirectMessages, 
  onOpenSearch, 
  onCreateSpace, 
  onOpenSettings 
}: QuickActionsCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          icon={MessageCircle}
          onClick={onOpenDirectMessages}
          className="flex flex-col h-16 text-xs"
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          Messages
        </Button>
        <Button
          variant="secondary"
          icon={Search}
          onClick={onOpenSearch}
          className="flex flex-col h-16 text-xs"
        >
          <Search className="w-5 h-5 mb-1" />
          Search
        </Button>
        <Button
          variant="secondary"
          icon={Globe}
          onClick={onCreateSpace}
          className="flex flex-col h-16 text-xs"
        >
          <Globe className="w-5 h-5 mb-1" />
          New Space
        </Button>
        <Button
          variant="secondary"
          icon={Settings}
          onClick={onOpenSettings}
          className="flex flex-col h-16 text-xs"
        >
          <Settings className="w-5 h-5 mb-1" />
          Settings
        </Button>
      </div>
    </Card>
  );
}