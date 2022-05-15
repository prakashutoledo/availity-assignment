import React from 'react';
import {createRoot} from 'react-dom/client';
import Application from './Application';
import {act} from "react-dom/test-utils";

it('Should render registration form in div', () => {
  let container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container!)?.render(<Application />);
  });
  expect(container?.querySelector('div')).toBeInTheDocument()
  expect(container?.querySelector('.App')).toBeInTheDocument()
  document.body.removeChild(container)
});
