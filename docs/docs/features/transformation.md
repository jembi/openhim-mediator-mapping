---
id: transformation
title: Transformation
sidebar_label: Transformation
---

The transformation section of the mapping mediator is useful for doing complex data manipulations within one endpoint call before mapping the data.
This helps reduce having to chain endpoint calls to achieve fairly simple data changes.
We use the [JSONata library](https://docs.jsonata.org/overview) to perform transformations and here we have listed a few commonly used transforms:

- Replace<br/>
    `$replace()` - this function will find a substring within the supplied value and replace it with your specified string. For example:<br/>
    `$replace('2021-01-01 00:00:00Z', ' ', 'T')` - this would replace the empty space with a 'T' to make the timestamp conform to ISO standards - `2021-01-01T00:00:00Z`
- Code mapping<br/>
    `$lookup()` - the first parameter supplied is a collection of key value pairs. The second is a placeholder variable. The lookup function then lookup the placeholder value within the key value collection and return value associated with that key. An example:<br/>
    `$lookup({'f': 'Female', 'm': 'Male', 'i': 'Intersex', 'u': 'Unknown'}, biologicalSex)` - this would return the corresponding word when supplied a valid key.
- String concatenation<br/>
    `&` - join the string values of the operands into a single resultant string. Values will be cast to strings.<br/>
    `'Patient/' & patient._id` => `Patient/123456`
