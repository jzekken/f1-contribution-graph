const fs = require('fs');
const { ArcadeRenderer } = require('./dist/pacman-contribution-graph.min.js');

async function testSvg() {
    return new Promise((resolve) => {
        const renderer = new ArcadeRenderer({
            game: 'pacman',
            platform: 'github',
            username: 'jzekken',
            gameTheme: 'github',
            playerStyle: 'opportunistic',
            githubSettings: { accessToken: '' },
            svgCallback: (svg) => {
                fs.writeFileSync('dist/pacman.svg', svg);
                console.log('Saved dist/pacman.svg');
            },
            gameStatsCallback: () => {},
            gameOverCallback: () => { resolve(); },
            pointsIncreasedCallback: () => {}
        });
        renderer.start().catch(console.error);
    });
}
testSvg();
