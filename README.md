# De-Formed Validations

De-Formed Validations is a robust and unopinionated API to manage form and data validations in JavaScript and React. With limitless scaling and 100% validation customization with almost zero learning curve, de-formed maintains its own internal state via simple function calls so that you can design your architecture the way you want to. Initially designed to manage client-side validations, it became so popular with our team we added the ability to run de-formed on the server as well. 

## Why Use De-Formed?

1. Modular: reusing and nesting validations are a snap.
2. Composable: simplifies scaling validations with large data types.
3. De-Coupled: maintain separation between your validation logic and your presentation/server logic.
4. Customizable: easily customize validation behavior in contextual and dynamic situations.
5. Agnostic: works for Client or Server.

## Install
```
yarn add de-formed-validations
```
```
npm install de-formed-validations
```
## React Usage

### Step 1: Create a file to define your validations.
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

## A Different Approach
Some of the most popular schema validation libraries available are bogged down by a numerous flags, properties, and identifiers; and while for really simple schemas they are great, lines of code should never be confused with readability or ease of scaling. Ultimately our team decided it did not make sense to build out our larger projects using libraries that favored syntax which becomes less readable as requirements become more complex. Another issue for us was that many of these libraries are not easily composed with other aspects of managing data validations such as updating the DOM with proper error messaging. Some of our clients have products which are 200k loc of almost nothing but form data, and so our requirements for validations were that they must be: 

* Composable
* Simple enough to learn in a day
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
