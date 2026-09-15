/**
 * Client device, sent by clients in the `device-type` header and stored on `api_logs`.
 * Never reorder or reuse values: they are persisted as integers.
 */
export enum DeviceType {
  UNKNOWN = 0,
  ANDROID = 1,
  IOS = 2,
  WEB = 3,
}
