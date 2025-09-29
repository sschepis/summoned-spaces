import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ 
  items, 
  separator,
  showHome = true,
  className = '' 
}: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/', icon: Home }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-500">
                {separator || <ChevronRight className="w-4 h-4" />}
              </span>
            )}
            
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </a>
            ) : (
              <span className={`flex items-center space-x-1 ${isLast ? 'text-white font-medium' : 'text-gray-400'}`}>
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}