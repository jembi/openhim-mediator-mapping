# Configuration files

The configuration files must be stored in this directory of the project root named endpoints. This endpoints directory should be further broken down into sub-directories each containing a minimum of four specific files: `meta.json`, `input-mapping.json`, `input-validation.json`, and `constants.json`. `output.json` is optional at this point. The endpoints directory should be in the following structure:

```txt
├── endpoints
    ├── Example Patient Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
    ├── Example Observation Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
    ├── Example Different Patient Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
```
