/**
 * Color Contrast Library
 * A lightweight utility for calculating color contrast and determining optimal text colors
 */

class ColorContrast {

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color string (e.g., "#FF0000" or "FF0000")
     * @returns {Object|null} RGB object {r, g, b} or null if invalid
     */
    static hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Handle 3-character hex
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Calculate relative luminance of a color
     * @param {number} r - Red component (0-255)
     * @param {number} g - Green component (0-255)
     * @param {number} b - Blue component (0-255)
     * @returns {number} Relative luminance (0-1)
     */
    static getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Calculate contrast ratio between two colors
     * @param {Object} color1 - RGB object {r, g, b}
     * @param {Object} color2 - RGB object {r, g, b}
     * @returns {number} Contrast ratio (1-21)
     */
    static getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1.r, color1.g, color1.b);
        const lum2 = this.getLuminance(color2.r, color2.g, color2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Determine if white text should be used on a given background color
     * @param {string} backgroundColor - Hex color string
     * @param {string} whiteColor - Hex color for white text (default: "#ffffff")
     * @param {string} darkColor - Hex color for dark text (default: "#343a40")
     * @returns {boolean} True if white text should be used, false for dark text
     */
    static shouldUseWhiteText(backgroundColor, whiteColor = "#ffffff", darkColor = "#343a40") {
        const bgColor = this.hexToRgb(backgroundColor);
        if (!bgColor) return false;

        const white = this.hexToRgb(whiteColor);
        const dark = this.hexToRgb(darkColor);

        if (!white || !dark) return false;

        const contrastWithWhite = this.getContrastRatio(bgColor, white);
        const contrastWithDark = this.getContrastRatio(bgColor, dark);

        return contrastWithWhite > contrastWithDark;
    }

    /**
     * Apply optimal text color to elements based on their background color
     * @param {NodeList|Array} elements - Elements to process
     * @param {Object} options - Configuration options
     * @param {string} options.backgroundProperty - CSS property or custom property name for background color
     * @param {string} options.whiteTextClass - CSS class for white text
     * @param {string} options.darkTextClass - CSS class for dark text
     * @param {string} options.whiteColor - Hex color for white text comparison
     * @param {string} options.darkColor - Hex color for dark text comparison
     */
    static applyOptimalTextColor(elements, options = {}) {
        const config = {
            backgroundProperty: '--project-color',
            whiteTextClass: 'text-white-contrast',
            darkTextClass: 'text-dark-contrast',
            whiteColor: '#ffffff',
            darkColor: '#343a40',
            ...options
        };

        elements.forEach(element => {
            let backgroundColor;

            // Get background color from CSS custom property or computed style
            if (config.backgroundProperty.startsWith('--')) {
                backgroundColor = getComputedStyle(element).getPropertyValue(config.backgroundProperty).trim();
            } else {
                backgroundColor = getComputedStyle(element)[config.backgroundProperty];
            }

            if (backgroundColor && backgroundColor !== '') {
                const useWhiteText = this.shouldUseWhiteText(
                    backgroundColor,
                    config.whiteColor,
                    config.darkColor
                );

                // Remove existing contrast classes
                element.classList.remove(config.whiteTextClass, config.darkTextClass);

                // Add appropriate class
                if (useWhiteText) {
                    element.classList.add(config.whiteTextClass);
                    element.setAttribute('data-text-color', 'white');
                } else {
                    element.classList.add(config.darkTextClass);
                    element.setAttribute('data-text-color', 'dark');
                }
            }
        });
    }

    /**
     * Get optimal text color for a background color
     * @param {string} backgroundColor - Hex color string
     * @param {string} whiteColor - Hex color for white text (default: "#ffffff")
     * @param {string} darkColor - Hex color for dark text (default: "#343a40")
     * @returns {string} 'white' or 'dark'
     */
    static getOptimalTextColor(backgroundColor, whiteColor = "#ffffff", darkColor = "#343a40") {
        return this.shouldUseWhiteText(backgroundColor, whiteColor, darkColor) ? 'white' : 'dark';
    }

    /**
     * Apply color contrast classes to element based on background color
     * @param {HTMLElement} element - Element to apply classes to
     * @param {string} backgroundColor - Background color to check against
     * @param {boolean} isHoverEffect - Whether this is for hover/focus effects
     * @param {string} whiteColor - Hex color for white text (default: "#ffffff")
     * @param {string} darkColor - Hex color for dark text (default: "#343a40")
     */
    static applyContrastClass(element, backgroundColor, isHoverEffect = false, whiteColor = "#ffffff", darkColor = "#343a40") {
        if (!backgroundColor || backgroundColor === '') return;

        const useWhiteText = this.shouldUseWhiteText(backgroundColor, whiteColor, darkColor);

        // Remove existing classes
        element.classList.remove('text-white-on-hover', 'text-dark-on-hover');

        // Add appropriate class
        if (isHoverEffect) {
            if (useWhiteText) {
                element.classList.add('text-white-on-hover');
            } else {
                element.classList.add('text-dark-on-hover');
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorContrast;
}

// Global availability
window.ColorContrast = ColorContrast;
