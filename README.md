# De-Formed Validations

De-Formed Validations is an unopinionated API to manage form validations in JavaScript.

De-Formed takes a simple schema definition and then provides you with either a JavaScript object or React Hook containing read-only objects and functions to handle validation-related tasks. Just define as many functions as you find necessary in your schema and then execute them on whichever events you choose. Very little attempt has been made to abstract the implementation of this API from the developer giving it a function-based, modular approach to design validation patterns that meet your requirements without the hassle of managing the validation data yourself.

## Why use De-Formed?

1. Maintain separation between form logic, presentation logic, and validation logic.
2. Easily customize validation behavior in contextual and dynamic situations.
3. Modular approach makes reusing and nested validations a snap.
4. Framework agnostic (React, Angular, Vue, Vanilla, etc., just plug and play).
5. Light-weight and easy to test.

## Usage

### Step 1: Create a file to define your validations.

To avoid unnecessary complexity, use the property names of the object you want to validate for the schema property names. Validation functions can receive a second parameter of state if needed.

```ts
export const PersonValidation = () => {
  return useValidation<Person>({
    firstName: [
      {
        errorMessage: 'First Name cannot be longer than 20 characters.',
        validation: (val: string) => val.length <= 20,
      },
    ],
    lastName: [
      {
        errorMessage: 'Must be Ross if fist name is Bob.',
        validation: (val: string, state: Dog) => {
          return state.name.toLowerCase() === 'bob'
            ? val.toLowerCase() === 'ross'
            : true;
        },
      },
      {
        errorMessage: 'Last Name cannot be longer than 20 characters.',
        validation: (val: string) => val.length <= 20,
      },
    ],
  });
};
```

## Step 2: Plug and Play

```tsx
export const PersonForm = ({ person, onChange }) => {
  const v = PersonValidation();

  const handleChange = v.validateOnChange(onChange, person);
  const handleBlur = v.validateOnBlur(person);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const canSubmit = v.validateAll(person);
    console.log('canSubmit', canSubmit);
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

Check out our [documentation](https://github.com/prescottbreeden/de-formed/wiki/Docs) in full.

## Examples

More [examples](https://github.com/prescottbreeden/de-formed/wiki/Examples) and CodeSandboxes.

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
