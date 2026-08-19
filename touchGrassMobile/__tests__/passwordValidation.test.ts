import {isStrongPassword} from '../src/utils/passwordValidation';

describe('isStrongPassword', () => {
  it('accepts a password containing every required character group', () => {
    expect(isStrongPassword('Touch123')).toBe(true);
  });

  it.each([
    'Short1',
    'lowercase1',
    'UPPERCASE1',
    'NoNumberHere',
  ])('rejects an invalid password: %s', password => {
    expect(isStrongPassword(password)).toBe(false);
  });
});
