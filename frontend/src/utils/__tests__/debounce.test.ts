import { debounce } from '../debounce';

describe('debounce', () => {
  jest.useFakeTimers();

  it('delays function execution', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('only executes once for multiple calls', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    jest.runAllTimers();
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('uses latest arguments', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc(1);
    debouncedFunc(2);
    debouncedFunc(3);

    jest.runAllTimers();
    expect(func).toHaveBeenCalledWith(3);
  });
}); 