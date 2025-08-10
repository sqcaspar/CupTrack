// Mock react-router-dom for Jest tests
module.exports = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Navigate: () => 'Navigate',
  Link: ({ children, to, ...props }) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
  useLocation: () => ({ pathname: '/dashboard' }),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
};