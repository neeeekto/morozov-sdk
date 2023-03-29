export const callOrGetValue = <TParams extends Array<unknown>, TResult>(
  valOrFn: TResult | ((...params: TParams) => TResult),
  ...params: TParams
) => {
  if (typeof valOrFn === 'function') {
    return (valOrFn as (...params: TParams) => TResult)(...params);
  }
  return valOrFn;
};
