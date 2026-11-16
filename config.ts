import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const ownerNumbers = new Set([
    '51928689473'
]);

export const config = {
    botName: 'MINIONS bot',
    devName: 'INGE',
    prefix: '.',
    owner: ownerNumbers,
    banner: 'https://files.catbox.moe/ap1laf.jpg',
    icon: 'https://files.catbox.moe/ap1laf.jpg',
    coin: '¥enes'
};

const __filename = fileURLToPath(import.meta.url);

fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(chalk.gray(`Updated ${path.basename(__filename)}`));
    import(`${import.meta.url}?update=${Date.now()}`);
});

export default config;
