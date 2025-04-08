/* Core */
import prettierConfigPolished from 'prettier-config-polished';

/**
 * @type {import("prettier").Config}
 */
export default {
    ...prettierConfigPolished,
    plugins: ['prettier-plugin-tailwindcss'],
};
