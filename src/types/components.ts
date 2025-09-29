import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Common size variants used across components
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CompactSize = 'sm' | 'md' | 'lg';

// Common variant types
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ColorVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'cyan' | 'blue' | 'green' | 'red' | 'yellow';

// Base component props that all components should extend
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Common props for interactive components
export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Form-related props
export interface FormComponentProps extends BaseComponentProps {
  name: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

// Icon props
export interface IconProps {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

// Layout props
export interface LayoutProps extends BaseComponentProps {
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  header?: ReactNode;
  footer?: ReactNode;
}

// Card props pattern
export interface CardProps extends BaseComponentProps {
  hover?: boolean;
  gradient?: string;
  padding?: CompactSize;
  onClick?: () => void;
}

// List props pattern
export interface ListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingCount?: number;
}

// Modal/Dialog props pattern
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: CompactSize | 'xl' | 'full';
  showCloseButton?: boolean;
}

// Action handler patterns
export type ActionHandler<T = void> = (action: string, data?: T) => void;

// Metric/Stats patterns
export interface Metric {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon | ReactNode;
  color?: string;
}

// User-related patterns
export interface UserBase {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
}

// Space-related patterns
export interface SpaceBase {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isPublic?: boolean;
  color?: string;
}

// Activity patterns
export interface ActivityMetrics {
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  hasShared?: boolean;
}

// Common render prop patterns
export type RenderProp<T> = (props: T) => ReactNode;

// Responsive prop patterns
export interface ResponsiveProps {
  mobile?: Partial<BaseComponentProps>;
  tablet?: Partial<BaseComponentProps>;
  desktop?: Partial<BaseComponentProps>;
}

// Animation patterns
export type AnimationType = 'fade' | 'slide' | 'scale' | 'none';
export interface AnimationProps {
  animation?: AnimationType;
  duration?: number;
  delay?: number;
}