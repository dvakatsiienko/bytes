/* Core */
import { Switch } from '@nextui-org/react';

/* Components */
import { /* SunIcon, */ MoonIcon } from '../ThemeSwitcher/icons';

export const ThemeSwitcher = () => {
    return (
        <Switch
            color = 'warning'
            css = {{ marginBottom: 5 }}
            size = 'sm'
            // thumbIcon = { <MoonIcon filled /> ?? <SunIcon filled /> }
            thumbIcon = { <MoonIcon filled /> }
            // eslint-disable-next-line no-console
            onChange = { () => console.log('test') }
        />
    );
};
