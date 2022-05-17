import {createRoot} from 'react-dom/client';
import Application from './application';
import {act} from "react-dom/test-utils";
jest.mock("")
it('Should render registration form in div', () => {
  let container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container!)?.render(<Application />);
  });
  expect(container?.querySelector('div')).toBeInTheDocument()
  expect(container?.querySelector('.Application')).toBeInTheDocument()
  document.body.removeChild(container)
});
