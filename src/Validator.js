const schemaParsers = require('./schema-parsers');

class Validator {
    constructor(schema) {
        this.schema = schema;
    }

    validateAndTransform(input) {        
        let result = {};
        this.schema.fields.forEach(field => {                
            const value = input[field.csvName];

            if (field.mandatory && !field.type=='aggregate' && (value === undefined || value === null)) {
                throw new Error(`Missing mandatory field: ${field.csvName}`);
            }

            if (value === undefined) return;

            switch (field.type) {
                case 'native':
                    this.validateNativeType(value, field.datatype, field.csvName);
                    result[field.name] = value;
                    break;
                case 'custom':
                    if (value) {
                        this.validateCustomType(value, field, field.csvName);
                        result[field.name] = schemaParsers[field.parser](value);
                    }                   
                    
                    break;
            }            
        });

        return result;
    }

    validateNativeType(value, datatype, fieldName) {
        switch (datatype) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new Error(`Field ${fieldName} is expected to be a string.`);
                }
                break;
            case 'number':
                if (isNaN(value)) {
                    throw new Error(`Field ${fieldName} is expected to be a number.`);
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    throw new Error(`Field ${fieldName} is expected to be a boolean.`);
                }
                break;
            case 'date':
                if (isNaN(Date.parse(value))) {
                    throw new Error(`Field ${fieldName} is expected to be a valid date.`);
                }
                break;
            default:
                throw new Error(`Unsupported data type ${datatype} for field ${fieldName}.`);
        }
    }

    validateCustomType(value, field, fieldName) {
        if (field.regex && !new RegExp(field.regex).test(value)) {
            throw new Error(`Field ${fieldName} with value ${value} does not match the required pattern: ${field.regex}`);
        }

        if (field.parser && schemaParsers[field.parser]) {
            const parsedValue = schemaParsers[field.parser](value);
            if (parsedValue === undefined) {
                throw new Error(`Parsing failed for field: ${fieldName}`);
            }            
        }
    }
}

module.exports = Validator;
