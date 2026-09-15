/**
 * Client application, sent by clients in the `app-type` header and stored on `api_logs`.
 * Replace these placeholders with your own apps. Never reorder or reuse values.
 */
export enum AppType {
  UNKNOWN = 0,
  WEB_APP = 1,
  MOBILE_APP = 2,
  ADMIN_PANEL = 3,
}
