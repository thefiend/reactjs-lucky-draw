import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/home/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/faq/Faq', () => {
  return function MockFaq() {
    return <div data-testid="faq-page">FAQ Page</div>;
  };
});

jest.mock('./pages/list/List', () => {
  return function MockList() {
    return <div data-testid="list-page">List Page</div>;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders Home page on root path', () => {
    window.history.pushState({}, 'Test', '/');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders FAQ page on /faq path', () => {
    window.history.pushState({}, 'Test', '/faq');
    render(<App />);
    expect(screen.getByTestId('faq-page')).toBeInTheDocument();
  });

  it('renders List page on /list path', () => {
    window.history.pushState({}, 'Test', '/list');
    render(<App />);
    expect(screen.getByTestId('list-page')).toBeInTheDocument();
  });
});
