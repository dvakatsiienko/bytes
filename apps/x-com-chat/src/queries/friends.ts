import { useQuery } from '@tanstack/react-query';

import type { Friend } from '.prisma/client';

export const useFriendListQuery = () => {
  const query = useQuery<Friend[]>({
    queryFn: async () => {
      try {
        const response = await fetch('/api/friends');
        const friendList = await response.json();

        return friendList;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    queryKey: ['friend-list'],
  });

  return query;
};
