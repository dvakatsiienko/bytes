import { InMemoryCache } from '@apollo/client';

import { typePolicies } from './typePolicies';

// The cache lives here rather than in client.ts so errorLink can evict without
// importing the client — links/index.ts is imported BY client.ts, and the cycle
// would only work by accident of hoisting.
export const cache = new InMemoryCache({ typePolicies });

export const evictPerUserFields = () => {
  cache.evict({ fieldName: 'userProfile' });
  cache.evict({ fieldName: 'launches' });
  cache.evict({ fieldName: 'launch' });
  cache.gc();
};
