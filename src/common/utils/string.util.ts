import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';
const MIXED_CASE_ALPHANUMERIC =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export class StringUtil {
  static uuid(): string {
    return uuidv4();
  }

  /**
   * Generates a cryptographically secure random lowercase alphanumeric token
   * @param length Length of the token to generate
   * @returns A random lowercase alphanumeric string
   */
  static generateAccessToken(length: number): string {
    return this.randomFrom(LOWERCASE_ALPHANUMERIC, length);
  }

  /**
   * Generates a cryptographically secure random alphanumeric string
   * @param length Length of the random string to generate
   * @returns A random alphanumeric string
   */
  static generateRandomString(length: number = 16): string {
    return this.randomFrom(MIXED_CASE_ALPHANUMERIC, length);
  }

  /**
   * Generates a URL-friendly slug from text
   * @param text The text to convert to a slug
   * @returns A URL-friendly slug
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static randomFrom(characters: string, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomInt(characters.length));
    }
    return result;
  }
}
