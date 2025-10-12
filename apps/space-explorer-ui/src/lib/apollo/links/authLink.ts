import { SetContextLink } from '@apollo/client/link/context';

export const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem('token') || '';

  return {
    headers: {
      ...prevContext.headers,
      Authorization: token,
    },
  };
});
