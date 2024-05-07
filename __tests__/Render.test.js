import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutPage from '../src/app/about/page.js'

afterEach(() => {
  cleanup();
});

test('Pages renders correctly', () => {
  render(<AboutPage />);
  const titleElement = screen.getByText(/Crunch, Crackle, Crumbl/i)
  expect(titleElement).toBeInTheDocument()
});
