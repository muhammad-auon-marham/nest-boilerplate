import * as bcrypt from 'bcryptjs';

export class PasswordUtil {
  private static readonly BCRYPT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Verify a password against a bcrypt hash
   * @param password Plain text password
   * @param hash Hashed password from database
   * @returns True if password matches
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check password strength
   * @param password Plain text password
   * @returns Strength score (0-4) and feedback
   */
  static checkStrength(password: string): {
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[@$!%*?&#]/.test(password)) score++;
    else feedback.push('Add special characters (@$!%*?&#)');

    const normalizedScore = Math.min(4, Math.floor(score / 1.5));

    const strengthMap = [
      'weak',
      'fair',
      'good',
      'strong',
      'very-strong',
    ] as const;

    return {
      score: normalizedScore,
      strength: strengthMap[normalizedScore],
      feedback,
    };
  }

  /**
   * Validate password meets minimum requirements
   * @param password Plain text password
   * @returns True if password meets requirements
   */
  static meetsRequirements(password: string): boolean {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&#]/.test(password)
    );
  }
}
