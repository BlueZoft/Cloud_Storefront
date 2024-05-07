import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutPage from '../src/app/about/page.js'
import ProductsPage from '../src/app/products/page.js'


test('AboutPage renders correctly', () => {
  render(<AboutPage />);
  const titleElement = screen.getByText(/Crunch, Crackle, Crumbl/i)
  expect(titleElement).toBeInTheDocument()

});

test('Products Page renders correctly', () => {
  render(<ProductsPage />);
  const buttonElement = screen.getByText(/Crunch, Crackle, Crumbl/i)
  expect(buttonElement).toBeInTheDocument();

});
