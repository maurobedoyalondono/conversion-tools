const fs = require('fs');
const SchemaLoader = require('./SchemaLoader');
const Validator = require('./Validator');
const Converter = require('./Converter');
const { log } = require('console');

class Orchestrator {
    constructor(schemaDirectory) {
        this.schemaLoader = new SchemaLoader(schemaDirectory);
    }

    async generate(mainSchemaName, inputPath, outputPath, aggregations = []) {
        try {
            const mainSchema = this.schemaLoader.loadSchema(mainSchemaName);
            let inputData = this.loadData(inputPath); // Assuming inputData is an array of objects (rows)

            const validator = new Validator(mainSchema);
            // Validate each row individually
            let transformedData = inputData.map(row => validator.validateAndTransform(row));

            console.log(`Processed ${transformedData.length} main schema objects.`);

            if (aggregations && aggregations.length > 0) {
                aggregations.forEach(aggregation => {                    

                    const [aggSchemaName, aggInputPath] = aggregation.split(';');
                    const aggSchema = this.schemaLoader.loadSchema(aggSchemaName);
                    let aggInputData = this.loadData(aggInputPath);

                    aggInputData = aggInputData.map(data => {
                        const aggValidator = new Validator(aggSchema);                       
                        return aggValidator.validateAndTransform(data);                        
                    });                    

                    // Filter and attach related aggregate data
                    const aggregateFieldInfo = mainSchema.fields.find(field => field.type === 'aggregate' && field.schema === aggSchemaName);
                    
                    if (aggregateFieldInfo && aggregateFieldInfo.aggregateKey) {
                        transformedData.forEach(mainData => {
                            mainData[aggregateFieldInfo.name] = aggInputData.filter(aggData => 
                                aggData[aggregateFieldInfo.aggregateKey.foreign] === mainData[aggregateFieldInfo.aggregateKey.main]);
                        });
                        console.log(`Aggregations for ${aggregateFieldInfo.name}: ${aggInputData.length}`);
                    }
                });
            }

            fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), 'utf8');
            console.log('Output successfully generated.');
        } catch (error) {
            console.error(`Error during generation: ${error.message}`);
        }
    }

    loadData(inputPath) {
        if (inputPath.endsWith('.csv')) {
            return JSON.parse(Converter.csvToJson(inputPath));
        } else {
            return JSON.parse(fs.readFileSync(inputPath, { encoding: 'utf8' }));
        }
    }
}

module.exports = Orchestrator;
