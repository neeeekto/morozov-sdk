import { callOrGetValue } from './http.utils';
import { IApiAction } from './api.types';
import { HttpClient } from './http.client';

export type ApiByScheme<
  TSchema extends Record<string, IApiAction<unknown, unknown>>
> = {
  [K in keyof TSchema]: TSchema[K] extends IApiAction<infer TReq, infer TRes>
    ? (req: TReq, abortSignal?: AbortSignal) => Promise<TRes>
    : unknown;
};

export interface ApiBySchemaConstructor<
  TSchema extends Record<string, IApiAction<unknown, unknown>>
> {
  new (http: HttpClient): ApiByScheme<TSchema>;
}

export function createApiClassBySchema<
  TSchema extends Record<string, IApiAction<unknown, unknown>>
>(schema: TSchema) {
  const ApiBySchema = class {
    constructor(public readonly http: HttpClient) {}
  };

  Object.entries(schema).forEach(([key, action]) => {
    (ApiBySchema as NewableFunction).prototype[key] = function (
      req: unknown,
      abortSignal?: AbortSignal
    ) {
      return (this.http as HttpClient)
        .fetch({
          url: callOrGetValue(action.url, req),
          params: callOrGetValue(action.params, req),
          data: callOrGetValue(action.data, req),
          headers: callOrGetValue(action.header, req),
          method: action.method,
          responseType: action.responseType,
          abortSignal,
        })
        .then((x) => x.data);
    };
  });

  return ApiBySchema as unknown as ApiBySchemaConstructor<TSchema>;
}
