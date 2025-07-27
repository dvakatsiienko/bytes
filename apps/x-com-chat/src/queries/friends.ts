
import { useQuery } from '@tanstack/react-query';
import type { Friend } from '.prisma/client/edge';

export const useFriendListQuery = () => {
    const query = useQuery<Friend[]>({
        queryKey: ['friend-list'],
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
    });

    return query;
};
