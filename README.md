# De-Formed Validations

De-Formed Validations is a robust and unopinionated API to manage form and data validations in JavaScript and React.  De-formed allows you 100% validation customization with almost zero learning curve and is built to scale. 

## TL;DR

1. Works for Client or Server.
2. Maintain separation between your validation logic and your presentation/server logic.
3. Easily customize validation behavior in contextual and dynamic situations.
4. Modular approach makes reusing and nested validations a snap.
5. De-coupled validation functions makes unit testing validation requirements easy.

## Install
```
yarn add de-formed-validations
```
```
npm install de-formed-validations
```
## React Usage

### Step 1: Create a file to define your validations.

To avoid unnecessary complexity, use the property names of the object you want to validate for the schema property names. Validation functions can receive a second parameter of state if needed.

```ts
// PersonValidation.ts
import { useValidation } from 'de-formed-validations';

export const PersonValidation = () => {
  return useValidation<Person>({
    firstName: [
      {
        errorMessage: 'First Name is required.',
        validation: (val: string) => val.length > 0,
      },
      {
        errorMessage: 'First Name cannot be longer than 20 characters.',
        validation: (val: string) => val.length <= 20,
      },
    ],
    lastName: [
      {
        errorMessage: 'Last Name is required.',
        validation: (val: string) => val.length > 0,
      },
      {
        errorMessage: 'Last Name cannot be longer than 20 characters.',
        validation: (val: string) => val.length <= 20,
      },
      {
        errorMessage: 'Must be Ross if fist name is Bob.',
        validation: (val: string, state: Person) => {
          return state.firstName === 'Bob' ? val === 'Ross' : true;
        },
      },
    ],
  });
};
```

### Step 2: Plug into React Component

```tsx
// PersonForm.component.tsx
import React from 'react';
import { PersonValidation } from './PersonValidation';

export const PersonForm = ({ person, onChange }) => {
  const v = PersonValidation();

  const handleChange = v.validateOnChange(onChange, person);
  const handleBlur = v.validateOnBlur(person);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const canSubmit = v.validateAll(person);
    if (canSubmit) {
      // submit logic
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name</label>
        <input
          name="firstName"
          onBlur={handleBlur}
          onChange={handleChange}
          value={person.firstName}
        />
        {v.getError('firstName') && <p>{v.getError('firstName')}</p>}
      </div>
      <div>
        <label>Last Name</label>
        <input
          name="lastName"
          onBlur={handleBlur}
          onChange={handleChange}
          value={person.lastName}
        />
        {v.getError('lastName') && <p>{v.getError('lastName')}</p>}
      </div>
      <button>Submit</button>
    </form>
  );
};
```
## Node/Express or Vanilla JavaScript Usage

### Step 1: Create a file to define your validations.

```js
// PersonValidation.js
import { Validation } from 'de-formed-validations';

export const PersonValidation = () => {
  return new Validation({
    firstName: [
      {
        errorMessage: 'First Name is required.',
        validation: val => val.length > 0,
      },
      {
        errorMessage: 'First Name cannot be longer than 20 characters.',
        validation: val => val.length <= 20,
      },
    ],
    lastName: [
      {
        errorMessage: 'Last Name is required.',
        validation: val => val.length > 0,
      },
      {
        errorMessage: 'Last Name cannot be longer than 20 characters.',
        validation: val => val.length <= 20,
      },
      {
        errorMessage: 'Must be Ross if fist name is Bob.',
        validation: (val, person) => {
          return person.firstName === 'Bob' ? val === 'Ross' : true;
        },
      },
    ],
  });
};
```

### Step 2: Import as needed

```js
// controller.js
const PersonValidation = require('./PersonValidation');

app.use("/", (req, res) => {
  const v = PersonValidation();
  v.validateAll(req.body);
  return v.isValid
    ? res.json('success')
    : res.json(v.validationState);
});
```
## Why use De-Formed?

Some of the most popular schema validation libraries available are bogged down by a numerous flags, properties, and identifiers; and while for really simple schemas they are great, lines of code should never be confused with readability. Ultimately our team decided it did not make sense to build out our larger projects using libraries that favored syntax which becomes less readable as requirements become more complex. Another issue for us was that many of these libraries are not easily composed with other aspects of managing data validations such as updating the DOM with proper error messaging. Some of our clients have products which are 200k lines of code and 99% form data, and so our requirements for validations were that is must be: 

* Composable
* Easy enough to learn in a day
* Powerful enough to handle any level of complexity
* Easy to unit test

De-Formed takes a simple schema and generates objects and functions to handle validation-related tasks. All validations are de-coupled from your form and controller architecture allowing them to be executed, reused, and composed together in any context necessary. Just define as many functions as you want in your schema and then execute them on whichever events you choose (client-side or server-side). This provides you with a function-based, modular approach to design validation patterns that meet your requirements without the hassle of managing the validation data yourself. If you are using Node for the Server, you can also return the validation state directly to the Client to automatically display errors on their corresponding fields. 

## Documentation

Check out the [documentation](https://github.com/prescottbreeden/de-formed-validations/wiki/Docs).

## Examples

More [examples](https://github.com/prescottbreeden/de-formed-validations/wiki/Examples) and CodeSandboxes.

## Coverage
![test coverage](https://github.com/prescottbreeden/de-formed-validations/blob/master/test-coverage.png?raw=true)

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
