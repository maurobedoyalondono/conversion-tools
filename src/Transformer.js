const schemaParsers = require('./schema-parsers');

class Transformer {
    constructor(schema) {
        this.schema = schema;
    }

    validateAndTransform(input) {        
        let result = {};
        this.schema.fields.forEach(field => {       
            const value = input[field.csvName];
            console.log(input);

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
                case 'localizable':
                    // Ensure the value format is correct according to the defined regex in the schema
                    this.validateLocalizableType(value, field, field.csvName);
                
                    // Dynamically parse the value based on schema specifications.
                    // This call retrieves the structured data with defaultText and localizations mapped accordingly.
                    const localizationOutput = schemaParsers.parseLocalization(value, field.localizationDetails);

                    console.log(localizationOutput);
                
                    // Assign the default text to the field specified by 'name'.
                    result[field.name] = localizationOutput.defaultText;

                    console.log(result);
                
                    // Merge any additional localizations into the result, under the field specified by the schema's localizationField.
                    if (field.localizationDetails.localizationField in localizationOutput && Object.keys(localizationOutput[field.localizationDetails.localizationField]).length > 0) {

                        console.log('Applying localization 1');
                        // Ensure the localization field exists in the result before merging.
                        if (!result[field.localizationDetails.localizationField]) {
                            result[field.localizationDetails.localizationField] = {};
                        }

                        console.log('Applying localization 2');
                
                        // Merge the additional localizations.
                        result[field.localizationDetails.localizationField] = {
                            ...result[field.localizationDetails.localizationField],
                            ...localizationOutput[field.localizationDetails.localizationField]
                        };

                        console.log('Localization applied');
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
