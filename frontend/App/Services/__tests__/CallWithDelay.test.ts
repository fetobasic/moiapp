import callWithDelay from 'App/Services/CallWithDelay';

jest.useFakeTimers();

describe('CallWithDelay', () => {
  test('should call the callback after the specified delay', () => {
    const callback = jest.fn();
    callWithDelay(callback);
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
  });
});
