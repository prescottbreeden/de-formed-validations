# De-Formed Validations

De-Formed Validations is an unopinionated API to manage form and data validations in JavaScript.

De-Formed takes a simple schema definition and then provides you with a JavaScript object containing read-only objects and functions to handle validation-related tasks. All validations are de-coupled from your form and controller architecture allowing them to be executed anywhere. Many validation libraries and schemas create a thick layer of properties and flags to stipulate types, required fields, and often try to bundle validation solutions with form and ORM solutions; however, as validation requirements become more complex, these libraries create unneccessary restrictions when all you need is a function that returns true/false.  With De-formed, just define as many functions as you find necessary in your schema and then execute them on whichever events you choose (browser- or server-side). This provides the developer with a function-based, modular approach to design validation patterns that meet your requirements without the hassle of managing the validation data yourself.

## Why use De-Formed?

1. Maintain separation between your validation logic, form logic, presentation logic, and/or server logic.
2. Easily customize validation behavior in contextual and dynamic situations.
3. Modular approach makes reusing and nested validations a snap.
4. Light-weight and easy to test.

## Install
```
yarn add de-formed-validations
```
```
npm install de-formed-validations
```
## Usage

### Step 1: Create a file to define your validations.

To avoid unnecessary complexity, use the property names of the object you want to validate for the schema property names. Validation functions can receive a second parameter of state if needed.

```ts
// React Hook with controlled input example

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

### Step 2: Plug and Play

```tsx
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

## Documentation

Check out the [documentation](https://github.com/prescottbreeden/de-formed-validations/wiki/Docs).

## Examples

More [examples](https://github.com/prescottbreeden/de-formed-validations/wiki/Examples) and CodeSandboxes.

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
