const fs = require('fs');
const SchemaLoader = require('./SchemaLoader');
const Transformer = require('./Transformer');
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

            const transformer = new Transformer(mainSchema);
            // Validate each row individually
            let transformedData = inputData.map(row => transformer.validateAndTransform(row));

            console.log(`Processed ${transformedData.length} main schema objects.`);

            if (aggregations && aggregations.length > 0) {
                aggregations.forEach(aggregation => {                    

                    const [aggSchemaName, aggInputPath] = aggregation.split(';');
                    const aggSchema = this.schemaLoader.loadSchema(aggSchemaName);
                    let aggInputData = this.loadData(aggInputPath);

                    aggInputData = aggInputData.map(data => {
                        const aggValidator = new Transformer(aggSchema);                       
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

            // Configurable post-processing for hierarchical data
            if (mainSchema.type === 'tree' && mainSchema.treeRelationship) {                
                let treeLikeData = this.buildTreeStructure(transformedData, mainSchema.treeRelationship);
                fs.writeFileSync(outputPath.replace('.json','-tree.json'), JSON.stringify(treeLikeData, null, 2), 'utf8');
            }

            fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), 'utf8');
            console.log('Output successfully generated.');
        } catch (error) {
            console.error(`Error during generation: ${error.message}`);
        }
    }

    buildTreeStructure(data, treeRelationship) {
        let tree = [];
        let map = {};
    
        data.forEach(item => {
            map[item[treeRelationship.id]] = {...item, items: []}; // Initialize with an items array for children
        });
    
        Object.keys(map).forEach(id => {
            let item = map[id];
            if (item[treeRelationship.parentId] && map[item[treeRelationship.parentId]]) {
                map[item[treeRelationship.parentId]].items.push(item); // Add to parent's items array
            } else {
                tree.push(item); // Root node
            }
        });
    
        return tree;
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
