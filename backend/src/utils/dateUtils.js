/**
 * Get the current year
 * @returns {number} Current year
 */
const getCurrentYear = () => {
    return new Date().getFullYear();
};

/**
 * Create a date string with current year
 * @param {string} monthDayTime - Month, day and time in format 'MM-DDTHH:mm:ss'
 * @returns {string} Full date string with current year
 */
const createDateWithCurrentYear = (monthDayTime) => {
    return `${getCurrentYear()}-${monthDayTime}`;
};

module.exports = {
    getCurrentYear,
    createDateWithCurrentYear
};
