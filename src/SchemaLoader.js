const fs = require('fs');
const path = require('path');

class SchemaLoader {
    constructor(schemaDirectory) {
        this.schemaDirectory = schemaDirectory;
    }

    loadSchema(schemaName) {
        const schemaPath = path.join(this.schemaDirectory, `${schemaName}-schema.json`);
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }
        return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
}

module.exports = SchemaLoader;
