import { useState, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, LucideIcon } from 'lucide-react';
import { Button } from '../../ui/Button';

interface MessageInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
  showAttachment?: boolean;
  showEmoji?: boolean;
  disabled?: boolean;
  maxLength?: number;
  helperText?: string;
  className?: string;
}

export function MessageInput({
  value: controlledValue,
  onChange: controlledOnChange,
  onSend,
  placeholder = 'Type a message...',
  showAttachment = true,
  showEmoji = true,
  disabled = false,
  maxLength,
  helperText = 'Press Enter to send',
  className = ''
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState('');
  
  // Use controlled or uncontrolled mode
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledOnChange || setInternalValue;

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const remainingChars = maxLength ? maxLength - value.length : null;

  return (
    <div className={`p-4 border-t border-white/10 ${className}`}>
      <div className="flex items-center space-x-3">
        {showAttachment && (
          <button 
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {showEmoji && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 
                       hover:text-white transition-colors"
              disabled={disabled}
            >
              <Smile className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          variant="primary"
          icon={Send}
          size="md"
          className="!p-3"
        >
          <span className="sr-only">Send</span>
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{helperText}</span>
        {remainingChars !== null && (
          <span className={remainingChars < 20 ? 'text-yellow-400' : ''}>
            {remainingChars} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}