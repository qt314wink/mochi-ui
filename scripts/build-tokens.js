const fs = require('fs');

// Read W3C format tokens
const tokens = JSON.parse(fs.readFileSync('./src/tokens/tokens.json', 'utf8'));

// Convert to Tokens Studio format
function convertToTokensStudio(w3cTokens) {
  const studioTokens = {};

  function flatten(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (value['$type'] && value['$value'] !== undefined) {
          const tokenPath = prefix ? `${prefix}.${key}` : key;

          switch (value['$type']) {
            case 'color':
              studioTokens[tokenPath] = { value: value['$value'], type: 'color' };
              break;
            case 'dimension':
              studioTokens[tokenPath] = { value: value['$value'], type: 'dimension' };
              break;
            case 'shadow':
              const v = value['$value'];
              studioTokens[tokenPath] = {
                value: {
                  x: v.offsetX || '0px',
                  y: v.offsetY || '0px',
                  blur: v.blur || '0px',
                  spread: v.spread || '0px',
                  color: v.color || '#000000',
                  type: 'dropShadow'
                },
                type: 'boxShadow'
              };
              break;
            case 'number':
              studioTokens[tokenPath] = { value: value['$value'], type: 'number' };
              break;
            case 'duration':
              studioTokens[tokenPath] = { value: value['$value'], type: 'duration' };
              break;
            case 'cubicBezier':
              studioTokens[tokenPath] = { value: value['$value'].join(', '), type: 'cubicBezier' };
              break;
            case 'fontFamily':
              studioTokens[tokenPath] = { value: value['$value'].join(', '), type: 'fontFamilies' };
              break;
            case 'fontWeight':
              studioTokens[tokenPath] = { value: String(value['$value']), type: 'fontWeights' };
              break;
          }
        } else {
          flatten(value, prefix ? `${prefix}.${key}` : key);
        }
      }
    }
  }

  flatten(w3cTokens.mochi || w3cTokens);
  return studioTokens;
}

// Convert to Figma Variables format
function convertToFigmaVariables(w3cTokens) {
  const variables = {
    version: '1.0',
    collections: []
  };

  // Colors collection
  const colorCollection = {
    name: 'Mochi UI - Colors',
    modes: [{ name: 'Light', variables: [] }]
  };

  function extractColors(obj, prefix = '') {
    const vars = [];
    for (const [key, value] of Object.entries(obj || {})) {
      if (value && value['$type'] === 'color') {
        vars.push({
          name: prefix ? `${prefix}/${key}` : key,
          type: 'COLOR',
          value: value['$value']
        });
      } else if (typeof value === 'object' && !Array.isArray(value) && !value['$type']) {
        vars.push(...extractColors(value, prefix ? `${prefix}/${key}` : key));
      }
    }
    return vars;
  }

  colorCollection.modes[0].variables = extractColors(w3cTokens.mochi?.color);
  variables.collections.push(colorCollection);

  return variables;
}

// Generate component specs
function generateComponentSpecs() {
  return {
    version: '1.0',
    components: {
      'Clay Button': {
        description: 'Triple-shadow button with spring physics',
        anatomy: [
          { name: 'Surface', type: 'frame', radius: '9999px', fill: 'colorway-bg' },
          { name: 'Shadow Lift', type: 'effect', shadow: '8px 8px 16px rgba(0,0,0,0.1)' },
          { name: 'Shadow Volume', type: 'effect', shadow: 'inset -4px -4px 8px rgba(0,0,0,0.05)' },
          { name: 'Shadow Reflection', type: 'effect', shadow: 'inset 4px 4px 8px rgba(255,255,255,0.8)' },
        ],
        variants: {
          colorway: ['mint', 'blue', 'pink', 'lavender', 'peach', 'neutral'],
          size: ['sm', 'md', 'lg'],
          state: ['default', 'hover', 'active', 'disabled'],
        },
        states: {
          default: { y: 0, scale: 1, shadowY: 8 },
          hover: { y: -6, scale: 1.05, shadowY: 12 },
          active: { y: 2, scale: 0.95, shadowY: 2 },
        },
        physics: {
          spring: { bounce: 0.4, duration: 300 },
          phases: ['compression', 'overshoot', 'settle']
        }
      },
      'Clay Card': {
        description: '4-layer shadow matrix card with 3D tilt',
        anatomy: [
          { name: 'Surface', type: 'frame', radius: '28px' },
          { name: 'Shadow Lift', type: 'effect', shadow: '0 8px 16px rgba(0,0,0,0.1)' },
          { name: 'Shadow Volume', type: 'effect', shadow: 'inset -10px -10px 20px rgba(0,0,0,0.05)' },
          { name: 'Shadow Reflection', type: 'effect', shadow: 'inset 10px 10px 20px rgba(255,255,255,0.8)' },
        ],
        variants: {
          variant: ['default', 'bento', 'stats'],
          colorway: ['mint', 'blue', 'pink', 'lavender', 'peach', 'neutral', 'ivory'],
        },
        interactions: {
          hover: { tilt: true, shine: true, lift: -8 },
          press: { scale: 0.98, inset: true }
        }
      },
      'Clay Toggle': {
        description: 'Spring-animated toggle with tactile knob',
        anatomy: [
          { name: 'Track', type: 'frame', radius: '9999px' },
          { name: 'Knob', type: 'ellipse', size: 28 },
          { name: 'Track Shadow', type: 'effect', shadow: 'inset 4px 4px 8px rgba(0,0,0,0.1)' },
          { name: 'Knob Shadow', type: 'effect', shadow: '2px 2px 6px rgba(0,0,0,0.15)' },
        ],
        states: {
          unchecked: { knobX: 4, trackBg: 'var(--bg-surface)' },
          checked: { knobX: 'calc(100% - 32px)', trackBg: 'var(--colorway)' },
        },
        physics: {
          knobSpring: { stiffness: 400, damping: 25 },
          haptic: 'Segment_Frequent_Tick'
        }
      },
      'Clay Slider': {
        description: 'Tactile slider with granular feedback',
        anatomy: [
          { name: 'Track', type: 'frame', radius: '9999px', height: 12 },
          { name: 'Fill', type: 'frame', radius: '9999px', gradient: true },
          { name: 'Knob', type: 'ellipse', size: 32 },
        ],
        interactions: {
          drag: { haptic: 'granular', knobScale: 1.2 },
          release: { snap: true, haptic: 'soft' }
        }
      },
      'Clay Input': {
        description: 'Inset shadow input with glow focus',
        anatomy: [
          { name: 'Surface', type: 'frame', radius: '16px' },
          { name: 'Inset Shadow', type: 'effect', shadow: 'inset 4px 4px 8px rgba(0,0,0,0.05)' },
          { name: 'Icon', type: 'instance', optional: true },
        ],
        states: {
          default: { insetShadow: 'inset 4px 4px 8px rgba(0,0,0,0.05)' },
          focus: { glow: 'var(--mochi-mint)', scale: 1.02 },
          error: { glow: '#FB7185', shake: true },
        }
      },
      'Clay Chart Bar': {
        description: '3D cylinder bar with volumetric shadow',
        anatomy: [
          { name: 'Bar', type: 'frame', radius: '9999px' },
          { name: 'Highlight', type: 'ellipse', position: 'top' },
          { name: 'Side Shadow', type: 'effect', gradient: true },
        ],
        animation: {
          entrance: { from: 'bottom', spring: true, delay: 'staggered' },
          hover: { tooltip: true, scale: 1.05 }
        }
      }
    }
  };
}

// Main export
const studioTokens = convertToTokensStudio(tokens);
const figmaVars = convertToFigmaVariables(tokens);
const componentSpecs = generateComponentSpecs();

// Ensure directory exists
if (!fs.existsSync('./figma-export')) {
  fs.mkdirSync('./figma-export', { recursive: true });
}

// Write outputs
fs.writeFileSync('./figma-export/tokens-studio.json', JSON.stringify(studioTokens, null, 2));
fs.writeFileSync('./figma-export/figma-variables.json', JSON.stringify(figmaVars, null, 2));
fs.writeFileSync('./figma-export/component-specs.json', JSON.stringify(componentSpecs, null, 2));

// Generate CSS variables
let cssOutput = '/* Mochi UI - Figma Styles Import */\n';
cssOutput += '/* Generated from W3C Design Tokens Format */\n\n';
cssOutput += ':root {\n';

for (const [key, token] of Object.entries(studioTokens)) {
  if (token.type === 'color') {
    cssOutput += `  --${key.replace(/\./g, '-')}: ${token.value};\n`;
  }
}

cssOutput += '}\n';

fs.writeFileSync('./figma-export/variables.css', cssOutput);

console.log('✅ Figma export complete!');
console.log('Files generated:');
console.log('  - figma-export/tokens-studio.json (Tokens Studio plugin)');
console.log('  - figma-export/figma-variables.json (Native Figma Variables)');
console.log('  - figma-export/component-specs.json (Component documentation)');
console.log('  - figma-export/variables.css (CSS import)');
