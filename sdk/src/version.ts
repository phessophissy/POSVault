export const SDK_VERSION = '1.1.0';
export const SDK_NAME = '@posvault/sdk';
export const SUPPORTED_CLARITY_VERSION = 4;

export function getUserAgent(): string {
  return `${SDK_NAME}/${SDK_VERSION}`;
}
