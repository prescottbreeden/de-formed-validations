# De-Formed Validations

De-Formed Validations is a robust and unopinionated API to manage form and data validations in JavaScript and React. With only a handful of properties to learn, de-formed maintains its own internal state with simple function calls so that you can design your architecture the way you want to.

## Why Use De-Formed?

1. Modular and Composable
2. Easier to learn than the effect of pissing into the wind
3. Powerful enough to handle any level of complexity
4. Works for Client or Server.

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
  return v.validateAll(req.body)
    ? res.json('success')
    : res.json(v.validationState);
});
```

## A Different Approach
Some of the most popular schema validation libraries available are bogged down by numerous flags and properties, and/or are tightly coupled with form libraries; and while for really simple schemas they are great, lines of code should never be confused with readability or ease of scaling. Our team discovered this the first time we had to scale a product that ended up with over 200k loc of highly-nested form data, leading us to appreciate that you don't always see the problems of a comfy minivan until you try to take it off-roading at 100mph. 

Ultimately our team decided it did not make sense to build out our larger projects using libraries that favored syntax which becomes less readable as requirements become more complex. Furthermore, as requirements become more complex, opinionated APIs just slow you down. Almost any beginner can write a function that evaluates whether a string is X characters long, so why do we need special properties to define that functionality? What we need is a way to organize, store, and re-use a series of functions that define the requirements. At the end of the day, most validation packages are written with the least useful properties becoming hurdles. Validations are easier to write and maintain when you can define the rules yourself rather than looking up the documentation on which pre-written rule satisfies the validation requirement your client just gave you. 

Another issue for us was that many validation libraries are not easily composed with other aspects of managing validations such as convenient two-way data binding between the validation state and the DOM so that error messaging is handled automatically with minimal effort. 

De-Formed takes a simple schema with two properties for each validation requirement: 1) the error message, 2) the function to execute. These properties are held in an array allowing you to define as many as you wish.  Once the schema is designed, just instantiate a new validation object wherever you need to validate data. While there are only a handful of functions and properties available on this object, you will find that most validation requirements will be easy to meet with just "validateOnChange", "validateOnBlur", "validateAll", and, "getError"; however, should you have really out-of-the-box requirements, you can use "validateCustom" to execute validations that involve dependencies on multiple unrelated schemas. 

Importantly, all validations are de-coupled from your form and controller architecture allowing them to be executed, reused, and composed together in any context necessary. Just define as many functions as you want in your schema and then execute them on whichever events you choose (client-side or server-side). This provides you with a function-based, modular approach to design validation patterns that meet your requirements without the hassle of managing the validation data yourself.

## Documentation

Check out the [documentation](https://github.com/prescottbreeden/de-formed-validations/wiki/Docs).

## Examples

More [examples](https://github.com/prescottbreeden/de-formed-validations/wiki/Examples) and CodeSandboxes.

## Coverage
![test coverage](https://github.com/prescottbreeden/de-formed-validations/blob/master/test-coverage.png?raw=true)

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
