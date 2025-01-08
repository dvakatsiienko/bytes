/* Core */
import prettierConfigPolished from 'prettier-config-polished';

export default {
    ...prettierConfigPolished,
    plugins: [ import.meta.resolve('prettier-plugin-tailwindcss') ],
};
