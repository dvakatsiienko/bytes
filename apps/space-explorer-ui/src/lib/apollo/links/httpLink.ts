import { HttpLink } from '@apollo/client/link/http';

const uri = import.meta.env.VITE_GQL_URL || 'http://localhost:4000/';

export const httpLink = new HttpLink({
  credentials: 'same-origin',
  uri,
});
