#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CARDS_PATH = path.join(ROOT, 'src', 'data', 'cards.js');
const BUNDLE_PATH = path.join(ROOT, 'src', 'app.bundle.js');

function readUtf8(filePath) {
    return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function parseCardsFromDataFile(fileText) {
    const startToken = 'export const cards = [';
    const start = fileText.indexOf(startToken);
    const end = fileText.lastIndexOf('];');
    if (start < 0 || end < 0 || end <= start) {
        throw new Error('Cannot locate cards array in src/data/cards.js');
    }

    const arraySource = fileText.slice(start + 'export const cards = '.length, end + 1);
    const cards = Function(`return ${arraySource}`)();
    if (!Array.isArray(cards)) {
        throw new Error('Parsed cards is not an array');
    }
    return cards;
}

function validateCards(cards) {
    if (cards.length === 0) {
        throw new Error('Cards array is empty');
    }

    const ids = cards.map((item) => item.id);
    const unique = new Set(ids);
    if (unique.size !== cards.length) {
        throw new Error('Duplicate card id detected');
    }

    const sorted = [...ids].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
        const expected = i + 1;
        if (sorted[i] !== expected) {
            throw new Error(`Card ids must be continuous from 1. Missing or invalid around ${expected}`);
        }
    }
}

function escapeSingleQuotedJsString(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function renderCardsBlock(cards) {
    const lines = ['const cards = ['];
    for (const card of cards) {
        lines.push(
            `    { id: ${card.id}, level: ${card.level}, category: '${escapeSingleQuotedJsString(card.category)}', question: '${escapeSingleQuotedJsString(card.question)}' },`
        );
    }
    lines.push('];', '', '');
    return lines.join('\n');
}

function syncBundle(cards, bundleText) {
    const start = bundleText.indexOf('const cards = [');
    const end = bundleText.indexOf('function filterCards', start);
    if (start < 0 || end < 0 || end <= start) {
        throw new Error('Cannot locate cards block in src/app.bundle.js');
    }

    const cardsBlock = renderCardsBlock(cards);
    return bundleText.slice(0, start) + cardsBlock + bundleText.slice(end);
}

function main() {
    const cardsSource = readUtf8(CARDS_PATH);
    const bundleSource = readUtf8(BUNDLE_PATH);

    const cards = parseCardsFromDataFile(cardsSource);
    validateCards(cards);

    const nextBundle = syncBundle(cards, bundleSource);
    fs.writeFileSync(BUNDLE_PATH, nextBundle, 'utf8');

    console.log(`Synced ${cards.length} cards to src/app.bundle.js`);
}

main();
