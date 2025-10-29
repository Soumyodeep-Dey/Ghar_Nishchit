/**
 * Get the current year
 * @returns {number} Current year
 */
export const getCurrentYear = () => {
    return new Date().getFullYear();
};

/**
 * Format a date string with current year
 * @param {string} monthDay - Month and day in format 'MM-DD'
 * @returns {string} Full date string with current year
 */
export const formatDateWithCurrentYear = (monthDay) => {
    return `${getCurrentYear()}-${monthDay}`;
};
