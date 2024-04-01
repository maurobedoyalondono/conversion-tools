# CSV to JSON Converter with Schema Validation and Data Aggregation

Convert CSV files to JSON, validating against schemas and aggregating data from multiple sources. Handles complex field formats with custom parsers.

## Features

- **CSV to JSON Conversion**: Converts CSV to JSON format.
- **Schema-Based Validation**: Validates against JSON schemas.
- **Data Aggregation**: Aggregates related data from multiple CSV sources.
- **Custom Field Parsing**: Transforms complex fields into structured JSON.
- **Field Filtering**: Includes only schema-defined fields in the output.

## Installation

Ensure [Node.js](https://nodejs.org/) is installed, then:

1. Clone the repository:
   ```bash
   git clone https://github.com/maurobedoyalondono/conversion-tools
   ```
2. Install dependencies:
   ```bash
   cd csv-to-json-converter && npm install
   ```

## Usage

Windows
```bash
node src/index.js convert -m race -i "./inputs/races.csv" -o "./outputs/races.json" -a "race-distance:./inputs/race-distances.csv"
```

Linux
```bash
node src/index.js convert -m race -i "inputs/races.csv" -o "outputs/races.json" -a "race-distance;inputs/race-distances.csv"

node src/index.js convert -m club -i "inputs/clubs.csv" -o "outputs/clubs.json" -a "club-location;inputs/club-locations.csv" -a "club-trainer;inputs/club-trainers.csv"
```

### Command Options

- `--main-schema`, `-m`: Primary schema for input validation. (Required)
- `--input`, `-i`: Input CSV file path. (Required)
- `--output`, `-o`: Output JSON file path. (Required)
- `--aggregation`, `-a`: Related schema and CSV file for aggregation. Repeatable.

## Custom Field Examples

### Location Field

- **Format**: `"country:colombia|department:san-andres|city:san-andres"`
- **JSON**:
  ```json
  {
    "country": "colombia",
    "department": "san-andres",
    "city": "san-andres"
  }
  ```

### Promotional Field

- **Values**: `"Yes|9"`, `"No"`
- **JSON** (for `"Yes|9"`):
  ```json
  {
    "featured": true,
    "weight": 9
  }
  ```

## Schema Definitions

Define data structure, types, and custom field parsers in JSON schema files.

### Race Schema (`race-schema.json`)

```json
{
  "name": "race",
  "fields": [
    {
      "name": "id",
      "type": "native",
      "datatype": "string"
    },
    {
      "name": "location",
      "type": "custom",
      "parser": "parseLocation",
      "regex": "^country:[^|]+\|department:[^|]+\|city:[^|]+$"
    },
    {
      "name": "promotional",
      "type": "custom",
      "parser": "parsePromotional",
      "regex": "^(Yes|No)(\|\d+)?$"
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
  ]
}
```

### Race-Distance Schema (`race-distance-schema.json`)

Defines individual distances associated with a race, linking back to the race via a `raceId`.

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
      "name": "distance",
      "csvName": "Distance",
      "type": "native",
      "datatype": "number",
      "mandatory": true
    },
    {
      "name": "unit",
      "csvName": "Unit",
      "type": "native",
      "datatype": "string",
      "mandatory": true
    }
  ]
}
```

### Implementing Custom Parsers (`schema-parsers.js`)

```javascript
exports.parseLocation = function(locationStr) { /* Implementation */ };
exports.parsePromotional = function(promotionalStr) { /* Implementation */ };
```

## Contributing

Contributions are welcome. Feel free to report issues, suggest features, or submit pull requests.

## License

This project is licensed under the MIT License.
