/**
 * Sync Bible verse cards to app.bundle.js
 * Converts cards.js format to app.bundle.js format
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CARDS_PATH = path.join(ROOT, 'src', 'data', 'cards.js');
const BUNDLE_PATH = path.join(ROOT, 'src', 'app.bundle.js');

function readUtf8(filePath) {
    return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function parseCardsFromDataFile(fileText) {
    const startToken = 'export const cards = ';
    const start = fileText.indexOf(startToken);
    const end = fileText.indexOf('];\n\nexport function getCardsByCategory', start);
    if (start < 0 || end < 0 || end <= start) {
        throw new Error('Cannot locate cards array in src/data/cards.js');
    }

    const arraySource = fileText.slice(start + startToken.length, end + 1);
    const cards = JSON.parse(arraySource);
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

function escapeJsString(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n');
}

function renderCardsBlock(cards) {
    const lines = ['const cards = ['];
    for (const card of cards) {
        lines.push(`    {`);
        lines.push(`        id: ${card.id},`);
        lines.push(`        category: '${escapeJsString(card.category)}',`);
        lines.push(`        categoryEn: '${escapeJsString(card.categoryEn)}',`);
        lines.push(`        icon: '${card.icon}',`);
        lines.push(`        color: '${card.color}',`);
        lines.push(`        reference: '${escapeJsString(card.reference)}',`);
        lines.push(`        text: '${escapeJsString(card.text)}',`);
        lines.push(`        question: '${escapeJsString(card.question)}'`);
        lines.push(`    },`);
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

    console.log(`Synced ${cards.length} Bible verse cards to src/app.bundle.js`);
}

main();
