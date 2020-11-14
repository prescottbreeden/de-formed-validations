import { prop } from '../utilities';

describe('prop', () => {
  it('returns undefined if object is null or undefined', () => {
    expect(prop('dingo', null)).toBe(undefined);
    expect(prop('dingo', undefined)).toBe(undefined);
  });
});
