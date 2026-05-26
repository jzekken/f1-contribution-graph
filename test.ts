const { PacmanRenderer } = require('./dist/pacman-contribution-graph.min.js');
console.log('Testing generateAnimatedSVG performance...');

const store = {
  config: { gameTheme: 'github' },
  contributions: [],
  gameHistory: Array.from({ length: 3000 }, (_, i) => ({
    pacman: { x: i % 50, y: i % 7, direction: 'right' },
    ghosts: [],
    grid: Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ color: '#ebedf0' })))
  })),
  grid: Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ color: '#ebedf0' }))),
  monthLabels: Array(53).fill('Jan'),
  ghosts: []
};

try {
  const start = Date.now();
  // We don't have the internal SVG object exported, but maybe we can just require the unminified source?
  const { SVG } = require('./src/pacman/renderers/svg.ts');
  const svgStr = SVG.generateAnimatedSVG(store);
  console.log(`Generated SVG of length ${svgStr.length} in ${Date.now() - start}ms`);
} catch (err) {
  console.error(err);
}
