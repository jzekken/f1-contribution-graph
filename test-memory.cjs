const fs = require('fs');
const { ArcadeRenderer } = require('./dist/pacman-contribution-graph.min.js'); // Use the root compiled package

async function testMemory() {
    console.log('Starting memory test...');
    let maxMem = 0;
    const interval = setInterval(() => {
        const mem = process.memoryUsage().heapUsed / 1024 / 1024;
        if (mem > maxMem) maxMem = mem;
    }, 100);

    const generate = () => {
        return new Promise((resolve) => {
            const renderer = new ArcadeRenderer({
                game: 'pacman',
                platform: 'github',
                username: 'jzekken',
                gameTheme: 'github',
                playerStyle: 'opportunistic',
                githubSettings: { accessToken: '' },
                svgCallback: () => {},
                gameStatsCallback: () => {},
                gameOverCallback: () => { resolve(); },
                pointsIncreasedCallback: () => {}
            });
            renderer.start().catch(console.error);
        });
    }

    console.log('Generating light...');
    await generate();
    console.log(`Max memory during light: ${maxMem.toFixed(2)} MB`);

    console.log('Generating dark...');
    await generate();
    console.log(`Max memory during dark: ${maxMem.toFixed(2)} MB`);

    clearInterval(interval);
}

testMemory().catch(console.error);
