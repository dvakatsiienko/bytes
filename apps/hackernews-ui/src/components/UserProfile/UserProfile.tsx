/* Core */
import * as GUI from '@geist-ui/react';

/* Components */
import { UpdateUserForm } from './UpdateUserForm';

/* Instruments */
import * as gql from '@/graphql';

export const UserProfile: React.FC<UserProfileProps> = (props) => {
    return (
        <GUI.Card>
            <GUI.Tabs initialValue = '1'>
                <GUI.Tabs.Item label = { props.isEditable ? 'My Info' : 'User' } value = '1'>
                    {props.isEditable && <h2>Welcome {props.user?.name}</h2>}
                    {!props.isEditable && (
                        <p>
                            <b>Full Name</b>: {props.user?.name}
                        </p>
                    )}

                    <p>
                        <b>Email</b>: {props.user?.email}
                    </p>
                    <p>
                        <b>Bio</b>: {props.user?.bio}
                    </p>
                </GUI.Tabs.Item>

                {props.isEditable && (
                    <GUI.Tabs.Item label = 'Edit' value = '2'>
                        <UpdateUserForm user = { props.user } />
                    </GUI.Tabs.Item>
                )}
            </GUI.Tabs>
        </GUI.Card>
    );
};

/* Types */
interface UserProfileProps {
    isEditable?: boolean;
    user: gql.UserFragment;
}
