import React from 'react';
import {
  act,
  reduxRender,
  screen,
  fireEvent,
  waitFor
} from '../../../test-utils';
import { showToast } from '../actions/toast';
import Toast from './Toast';

describe(`Toast`, () => {
  it('has persistent live region for screen readers', () => {
    reduxRender(<Toast />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveClass('sr-only');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('visual toast is hidden by default', () => {
    reduxRender(<Toast />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('announces and displays toast when action is dispatched', async () => {
    const { store } = reduxRender(<Toast />);
    act(() => {
      store.dispatch(showToast('Toast.SketchSaved'));
    });

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Sketch saved.');

    const visualToast = document.querySelector('.toast');
    expect(visualToast).toBeInTheDocument();
    expect(visualToast).toHaveTextContent('Sketch saved.');
  });

  it('closes visual toast automatically after time but keeps live region', async () => {
    const { store } = reduxRender(<Toast />);
    act(() => {
      store.dispatch(showToast('Toast.SketchSaved', 100));
    });

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Sketch saved.');

    expect(document.querySelector('.toast')).toBeInTheDocument();

    await waitFor(() => {
      expect(document.querySelector('.toast')).not.toBeInTheDocument();
    });

    expect(liveRegion).toBeInTheDocument();
  });

  it('closes when "X" button is pressed', () => {
    reduxRender(<Toast />, {
      initialState: { toast: { isVisible: true, text: 'Hello World' } }
    });
    const button = screen.getByRole('button', { name: 'Close Alert' });
    fireEvent.click(button);

    expect(document.querySelector('.toast')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
