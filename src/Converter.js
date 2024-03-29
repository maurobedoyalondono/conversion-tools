const fs = require('fs');
const parse = require('csv-parse/sync').parse;

class Converter {
    static csvToJson(filePath) {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true
        });
        return JSON.stringify(records, null, 2);
    }
}

module.exports = Converter;
