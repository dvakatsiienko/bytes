/* Core */
import { Switch, useTheme } from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';

/* Components */
import { SunIcon, MoonIcon } from '../ThemeSwitcher/icons';

export const ThemeSwitcher = () => {
    const { setTheme } = useNextTheme();
    const { isDark } = useTheme();

    return (
        <Switch
            bordered
            shadow
            checked = { isDark }
            color = 'warning'
            css = {{ marginBottom: 5 }}
            iconOff = { <MoonIcon filled /> }
            iconOn = { <SunIcon filled /> }
            size = 'sm'
            onChange = { (e) => setTheme(e.target.checked ? 'dark' : 'light') }
        />
    );
};
