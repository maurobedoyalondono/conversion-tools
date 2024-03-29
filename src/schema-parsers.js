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

    return {
        featured: featured,
        weight: weight
    };
};

exports.parseRegistrationStatus = function(registrationOpen) {
    return registrationOpen.toLowerCase() === 'yes'? 'open' : 'closed';
};