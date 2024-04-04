const schemaParsers = require('./schema-parsers');

class Transformer {
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
                    if (field.datatype == 'number') {
                        result[field.name] = +value;    
                    }else{
                        result[field.name] = value;
                    }                    
                    break;
                case 'custom':
                    if (value) {
                        this.validateCustomType(value, field, field.csvName);
                        result[field.name] = schemaParsers[field.parser](value);
                    }                   
                    
                    break;                
                case 'localizable':
                    const { defaultText, translations } = schemaParsers.parseLocalization(value, field.localizationDetails);
                    // Set the default language text directly on the field
                    result[field.name] = defaultText;
                    // Add translations to the result only if there are additional languages
                    if (translations) {
                        if (!result[field.localizationDetails.localizationField]) {
                            result[field.localizationDetails.localizationField] = {};
                        }
                        result[field.localizationDetails.localizationField][field.name] = translations;
                    }

                    break;
                default:
                    throw new Error(`Field type ${ield.type} is not supported.`);
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

    validateLocalizableType(value, field, fieldName) {
        if (field.regex && !new RegExp(field.regex).test(value)) {
            throw new Error(`Field ${fieldName} with value '${value}' does not match the required localizable pattern: ${field.regex}`);
        }
    }
    
}

module.exports = Transformer;
