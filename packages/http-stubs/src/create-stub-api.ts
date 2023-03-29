import { HttpRequest, IApiAction } from '@morozov-sdk/http';
import { callOrGetValue } from './utils';
import { DeepPartial } from 'ts-essentials';

export type HttpStubRequest = Readonly<
  Omit<
    HttpRequest,
    | 'withCredentials'
    | 'onDownloadProgress'
    | 'onUploadProgress'
    | 'xsrfCookieName'
    | 'xsrfHeaderName'
    | 'responseType'
  >
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IStub<TReq, TRes> {
  handle<T>(handler: (req: HttpStubRequest) => T): T;
}

type StubApiBySchema<TSchema extends Record<string, IApiAction<any, any>>> = {
  [K in keyof TSchema]: TSchema[K] extends IApiAction<infer TReq, infer TRes>
    ? (req: DeepPartial<TReq>) => IStub<TReq, TRes>
    : unknown;
};

export const createStubApi = <
  TSchema extends Record<string, IApiAction<any, any>>
>(
  schema: TSchema
) => {
  const result: any = {};

  Object.entries(schema).forEach(([key, action]) => {
    result[key] = (req: any) => {
      const stubReq: HttpStubRequest = {
        method: action.method,
        data: callOrGetValue(action.data, req),
        url: callOrGetValue(action.url, req),
        params: callOrGetValue(action.params, req),
        headers: callOrGetValue(action.header, req),
      };
      return {
        handle: <T>(handler: (req: HttpStubRequest) => T) => {
          return handler(stubReq);
        },
      };
    };
  });
  return result as StubApiBySchema<TSchema>;
};
