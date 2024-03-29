
# CSV to JSON Converter with Schema Validation and Data Aggregation

This tool is designed to convert CSV files to JSON format, ensuring adherence to specified schemas for data integrity and structure. It supports validating input data against these schemas, aggregating related data from multiple sources, and provides detailed logging of the conversion process.

## Features

- **CSV to JSON Conversion**: Efficiently converts CSV files into JSON format.
- **Schema-Based Validation**: Validates input data against customizable JSON schemas to ensure consistency and integrity.
- **Data Aggregation**: Enables the aggregation of related data from multiple CSV files based on specified relationships, akin to relational database joins.
- **Detailed Logging**: Offers comprehensive logging of the conversion process, including the number of processed records and details about the aggregated data.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed on your system. Then, follow these steps:

1. Clone the repository:
   ```
   git clone YOUR_REPOSITORY_URL
   ```
2. Navigate to the tool's directory:
   ```
   cd csv-to-json-converter
   ```
3. Install the necessary dependencies:
   ```
   npm install
   ```

## Usage

Execute the tool via the command line, specifying the main schema, input CSV file, output JSON file, and any necessary aggregation information through multiple uses of the `--aggregation` option.

### Command Structure

```
node index.js convert --main-schema "mainSchemaName" --input "path/to/input.csv" --output "path/to/output.json" --aggregation "relatedSchema:path/to/related.csv"
```

### Options

- `--main-schema`, `-m`: The name of the main schema for input validation (required).
- `--input`, `-i`: The path to the input CSV file to be converted (required).
- `--output`, `-o`: The desired path for the output JSON file (required).
- `--aggregation`, `-a`: Specifies a related schema and its corresponding CSV file for data aggregation. This option can be used multiple times for multiple related datasets.

### Example

```
node index.js convert --main-schema "race" --input "./data/race.csv" --output "./output/race.json" --aggregation "race-distance:./data/race-distance.csv"
```

This command converts `race.csv` to JSON, validates it against the `race` schema, and aggregates data from `race-distance.csv` using the `race-distance` schema.

## Schema Definitions

Schemas define the structure and type of data expected in the CSV files. They include specifications for native data types, custom validation patterns, and instructions for aggregating related data.

### Example Schema (`race-schema.json`)

```json
{
  "name": "race",
  "fields": [
    {
      "name": "id",
      "type": "native",
      "datatype": "string",
      "mandatory": true
    },
    {
        "name": "distances",
        "type": "aggregate",
        "schema": "race-distance",
        "mandatory": true,
        "aggregateKey": {
          "main": "id",
          "foreign": "raceId"
        }
      }
    ...
  ]
}
```

## Contributing

Contributions to enhance the functionality or documentation are welcome. Feel free to open issues or submit pull requests.

## License

This project is under the MIT License. See the LICENSE file for more details.

### Supported Types in Schemas

Schemas support the following field types to accommodate various data requirements:

- **Native Types**: Directly correspond to basic data types in JSON, such as `string`, `number`, and `boolean`.
- **Custom Types**: Allow specifying a regex pattern for field validation, enabling more complex validations beyond native type checking.
- **Aggregate Types**: Define relationships between different schemas, allowing for data from related entities to be combined based on specified keys.

### Aggregation Sample Schema (`race-distance-schema.json`)

This schema defines individual distances associated with races, which can be aggregated under a race entity based on the `raceId`.

```json
{
  "name": "race-distance",
  "fields": [
    {
      "name": "raceId",
      "csvName": "Race_ID",
      "type": "native",
      "datatype": "string",
      "mandatory": true
    },
    {
      "name": "length",
      "csvName": "Length",
      "type": "native",
      "datatype": "number",
      "mandatory": true
    },
    {
      "name": "startTime",
      "csvName": "Start_Time",
      "type": "native",
      "datatype": "string",
      "mandatory": true
    },
    {
      "name": "price",
      "csvName": "Price",
      "type": "native",
      "datatype": "number",
      "mandatory": true
    },
    {
      "name": "toughness",
      "csvName": "Toughness_Level",
      "type": "custom",
      "regex": "^[A-Za-z]+$",
      "mandatory": false
    }
  ]
}
```
