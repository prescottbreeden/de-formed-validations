import { renderHook, act } from '@testing-library/react-hooks';
import { useValidation } from '../validations/useValidation';
import { ValidationSchema, ValidationState } from '../validations/types';
import {map} from 'ramda';

const schema: ValidationSchema<any> = {
  name: [
    {
      errorMessage: 'Name is required.',
      validation: (val: string) => val.length > 0,
    },
    {
      errorMessage: 'Cannot be bob.',
      validation: (val: string) => val !== 'bob',
    },
    {
      errorMessage: 'Must be dingo.',
      validation: (val: string, state: any) => {
        return state.dingo ? val === 'dingo' : true;
      },
    },
  ],
  age: [
    {
      errorMessage: 'Must be 18',
      validation: (val: number) => val >= 18,
    },
  ],
};

const mockValidationState: ValidationState = {
  name: {
    isValid: true,
    error: '',
  },
  age: {
    isValid: true,
    error: '',
  },
};

const defaultState = {
  name: 'jack',
  dingo: false,
  age: 42,
};

const failingState = {
  ...defaultState,
  name: 'bob',
  age: 15,
};

describe('useValidation tests', () => {
  it('should be defined', () => {
    expect(useValidation).toBeDefined();
  });

  it('renders the hook correctly and checks types', () => {
    const { result } = renderHook(() => useValidation(schema));
    expect(typeof result.current.getError).toBe('function');
    expect(typeof result.current.getFieldValid).toBe('function');
    expect(typeof result.current.isValid).toBe('boolean');
    expect(typeof result.current.validate).toBe('function');
    expect(typeof result.current.validateAll).toBe('function');
    expect(typeof result.current.validateIfTrue).toBe('function');
    expect(typeof result.current.validateOnBlur).toBe('function');
    expect(typeof result.current.validateOnChange).toBe('function');
    expect(Array.isArray(result.current.validationErrors)).toBe(true);
    expect(typeof result.current.validationState).toBe('object');
  });

  it('returns all functions and read-only objects defined by hook', () => {
    const { result } = renderHook(() => useValidation(schema));
    expect(result.current.validationState).toStrictEqual(mockValidationState);
    expect(Object.keys(result.current)).toStrictEqual([
      'getError',
      'getFieldValid',
      'isValid',
      'resetValidationState',
      'validate',
      'validateAll',
      'validateCustom',
      'validateIfTrue',
      'validateOnBlur',
      'validateOnChange',
      'validationErrors',
      'validationState',
    ]);
  });

  describe('getError', () => {
    it('returns an empty string by default', () => {
      const { result } = renderHook(() => useValidation(schema));
      const output = result.current.getError('name');
      expect(output).toBe('');
    });

    it('returns an empty string if the property does not exist', () => {
      const { result } = renderHook(() => useValidation(schema));
      const output = result.current.getError('balls');
      expect(output).toBe('');
    });

    it('retrieves an error message', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'name';
      const value = '';
      const state = defaultState;
      act(() => {
        result.current.validate(name, value, state);
      });
      const output = result.current.getError('name');
      expect(output).toBe('Name is required.');
    });
  });

  describe('getFieldValid', () => {
    it('returns true by default', () => {
      const { result } = renderHook(() => useValidation(schema));
      const output = result.current.getFieldValid('name');
      expect(output).toBe(true);
    });

    it('returns true if the property does not exist', () => {
      const { result } = renderHook(() => useValidation(schema));
      const output = result.current.getFieldValid('balls');
      expect(output).toBe(true);
    });

    it('retrieves an invalid state', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'name';
      const value = '';
      const state = defaultState;
      act(() => {
        result.current.validate(name, value, state);
      });
      const output = result.current.getFieldValid('name');
      expect(output).toBe(false);
    });
  });

  describe('isValid', () => {
    it('returns true by default', () => {
      const { result } = renderHook(() => useValidation(schema));
      const output = result.current.isValid;
      expect(output).toBe(true);
    });

    it('changes to false after a validation fails', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'name';
      const value = 'bob';
      const state = defaultState;
      act(() => {
        result.current.validate(name, value, state);
      });
      const output = result.current.isValid;
      expect(output).toBe(false);
    });

    it('changes to true after a failed validation passes', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'name';
      const value = 'bob';
      const state = defaultState;
      act(() => {
        result.current.validate(name, value, state);
        result.current.validate(name, 'bob ross', state);
      });
      const output = result.current.isValid;
      expect(output).toBe(true);
    });
  });

  describe('validate', () => {
    it('returns a boolean if key exists', () => {
      const { result } = renderHook(() => useValidation(schema));
      let output: boolean | undefined;
      const name = 'name';
      const value = 'bob';
      const state = defaultState;
      act(() => {
        output = result.current.validate(name, value, state);
      });
      expect(typeof output).toBe('boolean');
    });

    it('returns undefined if key does not exist', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'balls';
      const value = 'bob';
      const state = defaultState;
      let output: boolean | undefined;
      act(() => {
        output = result.current.validate(name, value, state);
      });
      expect(typeof output).toBe('undefined');
    });

    it('updates the validationState when validation fails', () => {
      const { result } = renderHook(() => useValidation(schema));
      const validationState = {
        ...mockValidationState,
        name: {
          isValid: false,
          error: 'Must be dingo.',
        },
      };
      const name = 'name';
      const value = 'chuck';
      const state = { dingo: true };
      act(() => {
        result.current.validate(name, value, state);
      });
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationState).toStrictEqual(validationState);
    });
  });

  describe('validateAll', () => {
    it('returns a boolean', () => {
      const { result } = renderHook(() => useValidation(schema));
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateAll(defaultState);
      });
      expect(typeof output).toBe('boolean');
    });

    it('returns true if validations pass', () => {
      const { result } = renderHook(() => useValidation(schema));
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateAll(defaultState);
      });
      expect(output).toBe(true);
    });

    it('returns false if any validation fails', () => {
      const { result } = renderHook(() => useValidation(schema));
      act(() => {
        const output = result.current.validateAll(failingState);
        expect(output).toBe(false);
      });
    });

    it('handles nested validation reductions', () => {
      const data = [ defaultState, defaultState, defaultState ];
      const { result } = renderHook(() => useValidation(schema));
      let output: boolean[];
      act(() => {
        output = map(result.current.validateAll, data);
        expect(output).toStrictEqual([true, true, true]);
      });
    });
  });

  describe('validateCustom', () => {
    const weirdSchema = {
      namesAreAllBob: [
        {
          errorMessage: 'Names all have to be bob.',
          validation: (names: string[]) => {
            return names.reduce((acc: boolean, name: string) => {
              return acc ? name === 'bob' : false;
            }, true);
          },
        },
      ],
      namesAreAllDingo: [
        {
          errorMessage: 'Names all have to be dino if dingo is true.',
          validation: (names: string[], object: any) => {
            return names.reduce((acc: boolean, name: string) => {
              if (object.dingo === true) {
                return acc ? name === 'dingo' : false;
              }
              return true;
            }, true);
          },
        },
      ],
    };
    const validNames = ['bob', 'bob', 'bob'];
    it('returns a boolean', () => {
      const { result } = renderHook(() => useValidation(weirdSchema));
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateCustom([
          { key: 'namesAreAllBob', value: validNames },
        ]);
      });
      expect(typeof output).toBe('boolean');
    });

    it('returns true if validations pass', () => {
      const { result } = renderHook(() => useValidation(weirdSchema));
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateCustom([
          { key: 'namesAreAllBob', value: validNames },
        ]);
      });
      expect(output).toBe(true);
    });

    it('returns false if validations fail', () => {
      const { result } = renderHook(() => useValidation(weirdSchema));
      const invalidNames = ['jack', 'bob', 'bob'];
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateCustom([
          { key: 'namesAreAllBob', value: invalidNames },
        ]);
      });
      expect(output).toBe(false);
    });

    it('updates validation state', () => {
      const { result } = renderHook(() => useValidation(weirdSchema));
      const invalidNames = ['jack', 'bob', 'bob'];
      act(() => {
        result.current.validateCustom([
          { key: 'namesAreAllBob', value: invalidNames },
        ]);
      });
      expect(result.current.isValid).toBe(false);
    });

    it('takes an optional object for second argument', () => {
      const { result } = renderHook(() => useValidation(weirdSchema));
      const validNames = ['dingo', 'dingo', 'dingo'];
      act(() => {
        result.current.validateCustom([
          { key: 'namesAreAllDingo', value: validNames, state: { dingo: true } }
        ]);
      });
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validateIfTrue', () => {
    it('returns a boolean if key exists', () => {
      const { result } = renderHook(() => useValidation(schema));
      let output: boolean | undefined;
      const name = 'name';
      const value = 'bob';
      const state = defaultState;
      act(() => {
        output = result.current.validateIfTrue(name, value, state);
      });
      expect(typeof output).toBe('boolean');
    });

    it('returns undefined if key does not exist', () => {
      const { result } = renderHook(() => useValidation(schema));
      const name = 'balls';
      const value = 'bob';
      const state = defaultState;
      let output: boolean | undefined;
      act(() => {
        output = result.current.validateIfTrue(name, value, state);
      });
      expect(typeof output).toBe('undefined');
    });

    it('updates the validationState when validation fails', () => {
      const { result } = renderHook(() => useValidation(schema));
      const validationState = {
        ...mockValidationState,
      };
      const name = 'name';
      const value = 'chuck';
      const state = { dingo: true };
      act(() => {
        result.current.validateIfTrue(name, value, state);
      });
      expect(result.current.isValid).toBe(true);
      expect(result.current.validationState).toStrictEqual(validationState);
    });

    it('updates the validationState when an invalid validation succeeds', () => {
      const { result } = renderHook(() => useValidation(schema));
      const state = defaultState;
      const validationState = {
        ...mockValidationState,
      };
      act(() => {
        result.current.validate('name', 'bob', state);
      });
      expect(result.current.isValid).toBe(false);
      act(() => {
        result.current.validateIfTrue('name', 'jack', state);
      });
      expect(result.current.isValid).toBe(true);
      expect(result.current.validationState).toStrictEqual(validationState);
    });
  });

  describe('validateOnBlur', () => {
    it('returns a new function', () => {
      const { result } = renderHook(() => useValidation(schema));
      const state = defaultState;
      const handleBlur = result.current.validateOnBlur(state);
      expect(typeof handleBlur).toBe('function');
    });

    it('updates the valdiation state when called', () => {
      const { result } = renderHook(() => useValidation(schema));
      const state = defaultState;
      const handleBlur = result.current.validateOnBlur(state);
      const event = {
        target: {
          name: 'name',
          value: 'bob',
          dispatchEvent: new Event('blur'),
        },
      };
      act(() => {
        handleBlur(event as any);
      });
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('validateOnChange', () => {
    it('returns a new function', () => {
      const { result } = renderHook(() => useValidation(schema));
      const state = defaultState;
      const onChange = (event: any) => 'bob ross';
      const handleChange = result.current.validateOnChange(onChange, state);
      expect(typeof handleChange).toBe('function');
    });

    it('updates the valdiation state if true and returns event', () => {
      const { result } = renderHook(() => useValidation(schema));
      const state = defaultState;
      act(() => {
        result.current.validate('name', 'bob', defaultState);
      });
      expect(result.current.isValid).toBe(false);
      const onChange = (event: any) => 'bob ross';
      const handleChange = result.current.validateOnChange(onChange, state);
      const event = {
        target: {
          name: 'name',
          value: 'jack',
          dispatchEvent: new Event('change'),
        },
      };
      let output: any;
      act(() => {
        output = handleChange(event as any);
      });
      expect(result.current.isValid).toBe(true);
      expect(output).toBe('bob ross');
    });
  });

  describe('resetValidationState', () => {
    it('resets the validation state', () => {
      const { result } = renderHook(() => useValidation(schema));
      act(() => {
        result.current.validate('name', 'bob', defaultState);
        result.current.resetValidationState();
      });
      expect(result.current.isValid).toBe(true);

    });
  });

  describe('validationErrors', () => {
    it('starts as an empty array', () => {
      const { result } = renderHook(() => useValidation(schema));
      expect(result.current.validationErrors).toStrictEqual([]);
    });
    it('adds validation errors when validation state is invalid', () => {
      const { result } = renderHook(() => useValidation(schema));
      act(() => {
        result.current.validate('name', 'bob', defaultState);
      });
      expect(result.current.validationErrors).toStrictEqual(['Cannot be bob.']);
    });
    it('removes validation errors when validation state is valid', () => {
      const { result } = renderHook(() => useValidation(schema));
      act(() => {
        result.current.validate('name', 'bob', defaultState);
        result.current.validate('name', 'dingo', defaultState);
      });
      expect(result.current.validationErrors).toStrictEqual([]);
    });
  });
});
