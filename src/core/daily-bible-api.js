/**
 * 每日经文 API 服务
 * 使用 bible-api.com 获取随机经文
 */

const API_BASE_URL = 'https://bible-api.com';
const TRANSLATION = 'cuv'; // Chinese Union Version 和合本

// 书卷分类映射
const BOOK_CATEGORIES = {
    // 旧约 - 安慰与盼望
    comfort: ['PSA', 'ISA', 'JER', 'LAM'],
    // 新约 - 爱与恩典
    love: ['JHN', '1JN', 'EPH', 'ROM'],
    // 新约 - 信心
    faith: ['HEB', 'JAM', '1PE', '2PE'],
    // 新约 - 力量与勇气
    strength: ['PHP', '2TI', '1CO', '2CO'],
    // 旧约/新约 - 智慧
    wisdom: ['PRO', 'ECC', 'JAS', 'COL'],
    // 新约 - 赦免
    forgiveness: ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', 'EPH', 'COL', '1JN'],
    // 新约 - 盼望
    hope: ['ROM', '1CO', '2CO', 'PHP', 'COL', '1TH', '2TH', 'HEB', '1PE', '2PE', '1JN', 'REV']
};

/**
 * 获取随机经文
 * @param {string} category - 主题分类 (comfort, love, faith, strength, wisdom, forgiveness, hope)
 * @returns {Promise<Object>} 经文数据
 */
export async function fetchRandomVerse(category = null) {
    try {
        let url;
        
        if (category && BOOK_CATEGORIES[category]) {
            // 从指定分类的书卷中随机获取
            const books = BOOK_CATEGORIES[category];
            const randomBook = books[Math.floor(Math.random() * books.length)];
            url = `${API_BASE_URL}/data/${TRANSLATION}/random/${randomBook}`;
        } else {
            // 完全随机
            url = `${API_BASE_URL}/data/${TRANSLATION}/random`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            id: `api-${Date.now()}`,
            reference: data.reference,
            text: data.text,
            book: data.verses[0]?.book_name || '',
            chapter: data.verses[0]?.chapter || '',
            verse: data.verses[0]?.verse || '',
            translation: data.translation_name,
            category: category || 'daily',
            level: 1,
            isApiVerse: true,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('获取经文失败:', error);
        throw error;
    }
}

/**
 * 获取今日经文（基于日期，每天相同）
 * @returns {Promise<Object>} 经文数据
 */
export async function fetchDailyVerse() {
    const today = new Date().toDateString();
    const cacheKey = `dailyVerse_${today}`;
    
    // 检查本地缓存
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    try {
        const verse = await fetchRandomVerse();
        verse.isDailyVerse = true;
        
        // 缓存到本地
        localStorage.setItem(cacheKey, JSON.stringify(verse));
        
        return verse;
    } catch (error) {
        console.error('获取每日经文失败:', error);
        throw error;
    }
}

/**
 * 获取指定书卷的随机经文
 * @param {string} bookId - 书卷 ID (如: JHN, PSA)
 * @returns {Promise<Object>} 经文数据
 */
export async function fetchVerseFromBook(bookId) {
    try {
        const url = `${API_BASE_URL}/data/${TRANSLATION}/random/${bookId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            id: `api-${Date.now()}`,
            reference: data.reference,
            text: data.text,
            book: data.verses[0]?.book_name || '',
            chapter: data.verses[0]?.chapter || '',
            verse: data.verses[0]?.verse || '',
            translation: data.translation_name,
            category: 'specific',
            level: 2,
            isApiVerse: true,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('获取经文失败:', error);
        throw error;
    }
}

/**
 * 获取可用书卷列表
 * @returns {Promise<Array>} 书卷列表
 */
export async function fetchBooks() {
    try {
        const url = `${API_BASE_URL}/data/${TRANSLATION}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        return data.books || [];
    } catch (error) {
        console.error('获取书卷列表失败:', error);
        throw error;
    }
}

/**
 * 将 API 经文格式转换为应用卡片格式
 * @param {Object} apiVerse - API 返回的经文数据
 * @returns {Object} 应用卡片格式
 */
export function convertToCardFormat(apiVerse) {
    return {
        id: apiVerse.id,
        level: apiVerse.level || 1,
        category: apiVerse.category || 'daily',
        question: `${apiVerse.text}——${apiVerse.reference}`,
        reference: apiVerse.reference,
        text: apiVerse.text,
        isApiVerse: true,
        timestamp: apiVerse.timestamp
    };
}

/**
 * 预加载今日经文（在页面加载时调用）
 */
export async function preloadDailyVerse() {
    try {
        const verse = await fetchDailyVerse();
        return verse;
    } catch (error) {
        console.warn('预加载每日经文失败:', error);
        return null;
    }
}
