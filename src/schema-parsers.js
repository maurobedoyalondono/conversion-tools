// schema-parsers.js

/**
 * Parses the location string into a structured JSON object.
 * @param {string} location - The location string in the format "country:colombia|department:san-andres|city:san-andres".
 * @returns {object} Parsed location object.
 */
exports.parseLocation = function(location) {
    const parts = location.split('|');
    const locationObj = parts.reduce((acc, part) => {
        const [key, value] = part.split(':');
        acc[key] = value;
        return acc;
    }, {});
    return locationObj;
};

exports.parsePromotional = function(promotionalStr) {
    const parts = promotionalStr.split('|');
    const featured = parts[0] === 'Yes';
    const weight = featured && parts.length > 1 ? parseInt(parts[1], 10) : null;

    if (featured && !weight) {
        throw new Error('Promotion feature requires weight');
    }

    return {
        featured: featured,
        weight: weight
    };
};

exports.parseRegistrationStatus = function(registrationOpen) {
    return registrationOpen.toLowerCase() === 'yes'? 'open' : 'closed';
};

exports.parseTags = function(tagsStr) {
    return tagsStr.split('|').map(tag => {
        const parts = tag.split(':');
        const text = parts[0];
        const icon = parts.length > 1 ? parts[1] : ''; // Use an empty string if the icon is not provided
        return { text, icon };
    });
};
