import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

// Custom render function with common providers
export function renderWithProviders(ui: ReactElement, options = {}) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {children}
      </div>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Custom matchers for component testing
export const customMatchers = {
  toBeVisible: (element: HTMLElement) => {
    const pass = element.style.display !== 'none' && element.style.visibility !== 'hidden';
    return {
      pass,
      message: () => pass ? 'Element is visible' : 'Element is not visible'
    };
  },
  
  toHaveLoadingState: (element: HTMLElement) => {
    const hasSpinner = element.querySelector('.animate-spin');
    const hasLoadingText = element.textContent?.includes('Loading');
    const pass = !!(hasSpinner || hasLoadingText);
    
    return {
      pass,
      message: () => pass ? 'Element has loading state' : 'Element does not have loading state'
    };
  }
};

// Test utilities for form components
export const formTestUtils = {
  async fillForm(formData: Record<string, string>) {
    const user = userEvent.setup();
    
    for (const [name, value] of Object.entries(formData)) {
      const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') }) ||
                   screen.getByLabelText(new RegExp(name, 'i'));
      await user.clear(input);
      await user.type(input, value);
    }
  },

  async submitForm() {
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /submit|save|create|login|register/i });
    await user.click(submitButton);
  },

  expectFormError(_fieldName: string, errorMessage?: string) {
    const errorElement = screen.getByRole('alert') || 
                        screen.getByText(new RegExp(errorMessage || 'error', 'i'));
    expect(errorElement).toBeInTheDocument();
  }
};

// Test utilities for list components
export const listTestUtils = {
  expectListToHaveItems(count: number) {
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(count);
  },

  expectEmptyState(message?: string) {
    const emptyState = screen.getByText(message || /no.*found|empty/i);
    expect(emptyState).toBeInTheDocument();
  },

  expectLoadingState() {
    const loadingElements = screen.getAllByTestId('skeleton') || 
                           screen.getAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  }
};

// Test utilities for pagination
export const paginationTestUtils = {
  async goToPage(pageNumber: number) {
    const user = userEvent.setup();
    const pageButton = screen.getByRole('button', { name: pageNumber.toString() });
    await user.click(pageButton);
  },

  async goToNextPage() {
    const user = userEvent.setup();
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
  },

  async goToPreviousPage() {
    const user = userEvent.setup();
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);
  }
};

// Test data generators removed - tests should use real services or proper mocking
// For unit tests, use testing libraries like Jest mocks instead of static mock data

// Performance testing utilities
export const performanceUtils = {
  measureRenderTime: async (renderFunction: () => void) => {
    const start = performance.now();
    renderFunction();
    await waitFor(() => {
      // Wait for render to complete
    });
    const end = performance.now();
    return end - start;
  },

  expectFastRender: async (renderFunction: () => void, maxTime = 100) => {
    const renderTime = await performanceUtils.measureRenderTime(renderFunction);
    expect(renderTime).toBeLessThan(maxTime);
  }
};

// Accessibility testing utilities
export const a11yUtils = {
  expectProperHeadingStructure: () => {
    const headings = screen.getAllByRole('heading');
    // Verify heading levels are in proper order
    const levels = headings.map(h => parseInt(h.tagName.charAt(1)));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeLessThanOrEqual(levels[i-1] + 1);
    }
  },

  expectKeyboardNavigation: async (element: HTMLElement) => {
    const user = userEvent.setup();
    element.focus();
    expect(element).toHaveFocus();
    
    await user.keyboard('{Tab}');
    // Next focusable element should be focused
  },

  expectAriaLabels: (elements: HTMLElement[]) => {
    elements.forEach(element => {
      expect(element).toHaveAttribute('aria-label');
    });
  }
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent };