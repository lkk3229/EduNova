/* ============================================
   EduNova — Currency Localization
   Default: INR (Indian Rupees)
   Auto-detects user location via timezone.
   ============================================ */

(function () {
    'use strict';

    /* ---- Currency Data ---- */
    const CURRENCIES = {
        INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee',    rate: 1,      locale: 'en-IN'  },
        USD: { symbol: '$', code: 'USD', name: 'US Dollar',        rate: 0.012,  locale: 'en-US'  },
        EUR: { symbol: '€', code: 'EUR', name: 'Euro',             rate: 0.011,  locale: 'de-DE'  },
        GBP: { symbol: '£', code: 'GBP', name: 'British Pound',    rate: 0.0095, locale: 'en-GB'  },
        AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', rate: 0.018, locale: 'en-AU' },
        CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar',  rate: 0.016,  locale: 'en-CA'  },
        SGD: { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar', rate: 0.016,  locale: 'en-SG'  },
        AED: { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham',     rate: 0.044,  locale: 'ar-AE'  },
        JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen',     rate: 1.80,   locale: 'ja-JP'  },
        CNY: { symbol: '¥', code: 'CNY', name: 'Chinese Yuan',     rate: 0.087,  locale: 'zh-CN'  },
        BDT: { symbol: '৳', code: 'BDT', name: 'Bangladeshi Taka', rate: 1.31,   locale: 'bn-BD'  },
        NPR: { symbol: 'रू', code: 'NPR', name: 'Nepalese Rupee',  rate: 1.60,   locale: 'ne-NP'  },
        LKR: { symbol: 'Rs', code: 'LKR', name: 'Sri Lankan Rupee', rate: 3.60,  locale: 'si-LK'  },
        MYR: { symbol: 'RM', code: 'MYR', name: 'Malaysian Ringgit', rate: 0.055, locale: 'ms-MY' },
        ZAR: { symbol: 'R',  code: 'ZAR', name: 'South African Rand', rate: 0.22, locale: 'en-ZA' },
        BRL: { symbol: 'R$', code: 'BRL', name: 'Brazilian Real',   rate: 0.062,  locale: 'pt-BR'  },
        KRW: { symbol: '₩', code: 'KRW', name: 'South Korean Won', rate: 16.5,   locale: 'ko-KR'  },
        SAR: { symbol: 'ر.س', code: 'SAR', name: 'Saudi Riyal',    rate: 0.045,  locale: 'ar-SA'  },
    };

    /* Timezone → currency mapping */
    const TZ_CURRENCY_MAP = {
        'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Mumbai': 'INR',
        'Asia/Colombo': 'LKR',
        'Asia/Kathmandu': 'NPR', 'Asia/Katmandu': 'NPR',
        'Asia/Dhaka': 'BDT',
        'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD',
        'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD', 'US/Eastern': 'USD',
        'US/Central': 'USD', 'US/Mountain': 'USD', 'US/Pacific': 'USD',
        'Europe/London': 'GBP', 'Europe/Dublin': 'GBP',
        'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Rome': 'EUR',
        'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR',
        'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
        'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
        'Asia/Singapore': 'SGD',
        'Asia/Dubai': 'AED', 'Asia/Muscat': 'AED',
        'Asia/Tokyo': 'JPY',
        'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'CNY',
        'Asia/Kuala_Lumpur': 'MYR',
        'Africa/Johannesburg': 'ZAR',
        'America/Sao_Paulo': 'BRL',
        'Asia/Seoul': 'KRW',
        'Asia/Riyadh': 'SAR',
    };

    /* ---- Detect user currency ---- */
    function detectCurrency() {
        // 1. Check user preference in localStorage
        const saved = localStorage.getItem('edunova_currency');
        if (saved && CURRENCIES[saved]) return saved;

        // 2. Try timezone-based detection
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz && TZ_CURRENCY_MAP[tz]) return TZ_CURRENCY_MAP[tz];
        } catch (e) { /* ignore */ }

        // 3. Default to INR
        return 'INR';
    }

    /* ---- Core API ---- */
    const userCurrencyCode = detectCurrency();

    /**
     * Get the active currency info object.
     */
    function getCurrency() {
        return CURRENCIES[userCurrencyCode];
    }

    /**
     * Convert a base-INR price to the user's currency and format it.
     * @param {number} amountINR — price in Indian Rupees
     * @param {boolean} [showCode=false] — append currency code (e.g. "₹4,199.00 INR")
     * @returns {string} formatted price string
     */
    function formatPrice(amountINR, showCode) {
        if (amountINR === 0) return 'Free';

        const cur = CURRENCIES[userCurrencyCode];
        const converted = amountINR * cur.rate;

        // Use Intl.NumberFormat for proper locale formatting
        let formatted;
        try {
            formatted = new Intl.NumberFormat(cur.locale, {
                style: 'currency',
                currency: cur.code,
                minimumFractionDigits: cur.code === 'JPY' || cur.code === 'KRW' ? 0 : 2,
                maximumFractionDigits: cur.code === 'JPY' || cur.code === 'KRW' ? 0 : 2,
            }).format(converted);
        } catch (e) {
            formatted = cur.symbol + converted.toFixed(2);
        }

        if (showCode) formatted += ' ' + cur.code;
        return formatted;
    }

    /**
     * Get just the numeric converted value (for calculations).
     */
    function convertPrice(amountINR) {
        return amountINR * CURRENCIES[userCurrencyCode].rate;
    }

    /**
     * Get the currency symbol.
     */
    function getCurrencySymbol() {
        return CURRENCIES[userCurrencyCode].symbol;
    }

    /**
     * Set user's preferred currency and reload.
     */
    function setCurrency(code) {
        if (CURRENCIES[code]) {
            localStorage.setItem('edunova_currency', code);
            window.location.reload();
        }
    }

    /**
     * Get all available currencies for a selector.
     */
    function getAllCurrencies() {
        return Object.keys(CURRENCIES).map(code => ({
            code,
            symbol: CURRENCIES[code].symbol,
            name: CURRENCIES[code].name
        }));
    }

    /* ---- Expose globally ---- */
    window.EduCurrency = {
        format: formatPrice,
        convert: convertPrice,
        symbol: getCurrencySymbol,
        get: getCurrency,
        set: setCurrency,
        all: getAllCurrencies,
        code: userCurrencyCode
    };

})();
