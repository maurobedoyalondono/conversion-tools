#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Orchestrator = require('./Orchestrator');

const orchestrator = new Orchestrator('./schemas');

yargs(hideBin(process.argv))
  .command(
    'convert',
    'Converts a CSV file to JSON format using a defined schema, with optional schema-based data aggregation',
    (yargs) => {
      yargs.option('main-schema', {
        alias: 'm',
        describe: 'The name of the main schema to validate the data against',
        type: 'string',
        demandOption: true,
      })
      .option('input', {
        alias: 'i',
        describe: 'Path to the input CSV file',
        type: 'string',
        demandOption: true,
      })
      .option('output', {
        alias: 'o',
        describe: 'Path where the output JSON file should be saved',
        type: 'string',
        demandOption: true,
      })
      .option('aggregation', {
        alias: 'a',
        describe: 'Schema and input file for aggregation in the format schemaName:inputFilePath. Can be used multiple times for multiple aggregations.',
        type: 'array',
      });
    },
    async (argv) => {
      console.log('converting...');
      await orchestrator.generate(argv['main-schema'], argv.input, argv.output, argv.aggregation);
    }
  )
  .help()
  .argv;
