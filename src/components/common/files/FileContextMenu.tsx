import { useRef, useEffect } from 'react';
import { Download, Eye, Star, Trash2, LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface FileContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items?: ContextMenuItem[];
  className?: string;
}

const defaultItems: ContextMenuItem[] = [
  {
    id: 'summon',
    label: 'Summon File',
    icon: Download,
    onClick: () => {}
  },
  {
    id: 'details',
    label: 'View Details',
    icon: Eye,
    onClick: () => {}
  },
  {
    id: 'favorite',
    label: 'Add to Favorites',
    icon: Star,
    onClick: () => {}
  },
  {
    id: 'delete',
    label: 'Delete File',
    icon: Trash2,
    variant: 'danger',
    onClick: () => {}
  }
];

export function FileContextMenu({
  x,
  y,
  onClose,
  items = defaultItems,
  className = ''
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className={`fixed z-50 bg-slate-800 rounded-lg shadow-2xl border border-white/10 py-2 min-w-48 ${className}`}
        style={{ left: x, top: y }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isDanger = item.variant === 'danger';
          
          return (
            <div key={item.id}>
              {index > 0 && index === items.length - 1 && items[index - 1].variant !== 'danger' && (
                <hr className="border-white/10 my-2" />
              )}
              <button
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2 ${
                  isDanger 
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}