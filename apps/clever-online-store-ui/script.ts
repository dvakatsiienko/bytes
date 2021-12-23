#!/usr/bin/env zx

import 'zx/globals';

(async () => {
    const bear = await question('What kind of bear is best? ');
    const token = await question('Choose env variable: ', {
        choices: Object.keys(process.env),
    });

    await $`echo ${bear}`;
    console.log(token);
})();
