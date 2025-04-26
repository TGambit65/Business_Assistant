import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailRulesPageRefactored from '../pages/email/EmailRulesPageRefactored';

// Mock the toast context
jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

// Mock the components
jest.mock('../components/email/rules/RulesList', () => ({
  __esModule: true,
  default: ({ rules, onEditRule, onDeleteRule, onToggleRule, onAddRule }) => (
    <div data-testid="rules-list">
      <button data-testid="add-rule-button" onClick={onAddRule}>Add Rule</button>
      <ul>
        {rules.map(rule => (
          <li key={rule.id} data-testid={`rule-${rule.id}`}>
            {rule.name}
            <button onClick={() => onEditRule(rule.id)}>Edit</button>
            <button onClick={() => onDeleteRule(rule.id)}>Delete</button>
            <button onClick={() => onToggleRule(rule.id)}>Toggle</button>
          </li>
        ))}
      </ul>
    </div>
  )
}));

jest.mock('../components/email/rules/RuleForm', () => ({
  __esModule: true,
  default: ({ rule, isEditing, onChange, onSave, onCancel }) => (
    <div data-testid="rule-form">
      <input
        data-testid="rule-name-input"
        value={rule.name}
        onChange={(e) => onChange({ ...rule, name: e.target.value })}
      />
      <button data-testid="save-rule-button" onClick={onSave}>
        {isEditing ? 'Update Rule' : 'Create Rule'}
      </button>
      <button data-testid="cancel-rule-button" onClick={onCancel}>Cancel</button>
    </div>
  )
}));

jest.mock('../components/email/rules/LabelsList', () => ({
  __esModule: true,
  default: ({ labels, onEditLabel, onDeleteLabel, onAddLabel, onReorderLabels }) => (
    <div data-testid="labels-list">
      <button data-testid="add-label-button" onClick={onAddLabel}>Add Label</button>
      <ul>
        {labels.map(label => (
          <li key={label.id} data-testid={`label-${label.id}`}>
            {label.name}
            <button onClick={() => onEditLabel(label.id)}>Edit</button>
            <button onClick={() => onDeleteLabel(label.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}));

jest.mock('../components/email/rules/LabelForm', () => ({
  __esModule: true,
  default: ({ label, isEditing, onChange, onSave, onCancel, onGenerateAIRules }) => (
    <div data-testid="label-form">
      <input
        data-testid="label-name-input"
        value={label.name}
        onChange={(e) => onChange({ ...label, name: e.target.value })}
      />
      <button data-testid="generate-ai-rules-button" onClick={onGenerateAIRules}>
        Generate AI Rules
      </button>
      <button data-testid="save-label-button" onClick={onSave}>
        {isEditing ? 'Update Label' : 'Create Label'}
      </button>
      <button data-testid="cancel-label-button" onClick={onCancel}>Cancel</button>
    </div>
  )
}));

// Mock the Tabs component
jest.mock('../../components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="tabs-container">{children}</div>,
  TabsContent: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }) => <button role="tab" data-testid={`tab-${value}`}>{children}</button>
}));

describe('EmailRulesPageRefactored', () => {
  test('renders with rules tab active by default', () => {
    render(<EmailRulesPageRefactored />);

    expect(screen.getByText('Email Rules & Labels')).toBeInTheDocument();
    expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    expect(screen.queryByTestId('labels-list')).not.toBeInTheDocument();
  });

  test('switches to labels tab when clicked', () => {
    render(<EmailRulesPageRefactored />);

    // Click on Labels tab
    fireEvent.click(screen.getByRole('tab', { name: 'Labels' }));

    expect(screen.getByTestId('labels-list')).toBeInTheDocument();
    expect(screen.queryByTestId('rules-list')).not.toBeInTheDocument();
  });

  test('shows rule form when Add Rule is clicked', async () => {
    render(<EmailRulesPageRefactored />);

    // Click Add Rule button
    fireEvent.click(screen.getByTestId('add-rule-button'));

    await waitFor(() => {
      expect(screen.getByTestId('rule-form')).toBeInTheDocument();
      expect(screen.queryByTestId('rules-list')).not.toBeInTheDocument();
    });
  });

  test('shows label form when Add Label is clicked', async () => {
    render(<EmailRulesPageRefactored />);

    // Switch to Labels tab
    fireEvent.click(screen.getByRole('tab', { name: 'Labels' }));

    // Click Add Label button
    fireEvent.click(screen.getByTestId('add-label-button'));

    await waitFor(() => {
      expect(screen.getByTestId('label-form')).toBeInTheDocument();
      expect(screen.queryByTestId('labels-list')).not.toBeInTheDocument();
    });
  });

  test('adds a new rule when form is submitted', async () => {
    render(<EmailRulesPageRefactored />);

    // Click Add Rule button
    fireEvent.click(screen.getByTestId('add-rule-button'));

    // Fill in rule name
    const nameInput = await screen.findByTestId('rule-name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Rule' } });

    // Save the rule
    fireEvent.click(screen.getByTestId('save-rule-button'));

    // Should go back to rules list
    await waitFor(() => {
      expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    });
  });

  test('adds a new label when form is submitted', async () => {
    render(<EmailRulesPageRefactored />);

    // Switch to Labels tab
    fireEvent.click(screen.getByRole('tab', { name: 'Labels' }));

    // Click Add Label button
    fireEvent.click(screen.getByTestId('add-label-button'));

    // Fill in label name
    const nameInput = await screen.findByTestId('label-name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Label' } });

    // Save the label
    fireEvent.click(screen.getByTestId('save-label-button'));

    // Should go back to labels list
    await waitFor(() => {
      expect(screen.getByTestId('labels-list')).toBeInTheDocument();
    });
  });

  test('cancels rule form when cancel button is clicked', async () => {
    render(<EmailRulesPageRefactored />);

    // Click Add Rule button
    fireEvent.click(screen.getByTestId('add-rule-button'));

    // Cancel the form
    fireEvent.click(await screen.findByTestId('cancel-rule-button'));

    // Should go back to rules list
    await waitFor(() => {
      expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    });
  });

  test('cancels label form when cancel button is clicked', async () => {
    render(<EmailRulesPageRefactored />);

    // Switch to Labels tab
    fireEvent.click(screen.getByRole('tab', { name: 'Labels' }));

    // Click Add Label button
    fireEvent.click(screen.getByTestId('add-label-button'));

    // Cancel the form
    fireEvent.click(await screen.findByTestId('cancel-label-button'));

    // Should go back to labels list
    await waitFor(() => {
      expect(screen.getByTestId('labels-list')).toBeInTheDocument();
    });
  });
});
