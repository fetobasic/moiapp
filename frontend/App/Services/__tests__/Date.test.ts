import { getDataTitle } from 'App/Services/Date';

describe('Date', () => {
  test('should return "Never" if date is falsy', () => {
    expect(getDataTitle(0)).toBe('Never');
    // @ts-ignore as we want to test invalid rules
    expect(getDataTitle(null)).toBe('Never');
    // @ts-ignore as we want to test invalid rules
    expect(getDataTitle(undefined)).toBe('Never');
  });

  test('should return "Today" if date is today', () => {
    const today = new Date();
    expect(getDataTitle(today.getTime() / 1000)).toBe('Today');
  });

  test('should return "Yesterday" if date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getDataTitle(yesterday.getTime() / 1000)).toBe('Yesterday');
  });

  test('should return a formatted date if it is neither today nor yesterday', () => {
    const someDate = new Date('2023-10-01');
    expect(getDataTitle(someDate.getTime() / 1000)).toBe('01/10/23');
  });
});
