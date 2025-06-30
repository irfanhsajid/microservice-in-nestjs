export class DateUtils {
  /**
   * Returns a new Date with time set to 00:00:00
   */
  static stripTime(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from a date
   */
  static subtractDays(date: Date, days: number): Date {
    return DateUtils.addDays(date, -days);
  }

  /**
   * Compare if two dates are the same (date-only, ignoring time)
   */
  static isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Checks if a date is before another (optionally ignoring time)
   */
  static isBefore(date1: Date, date2: Date, ignoreTime = false): boolean {
    if (ignoreTime) {
      date1 = DateUtils.stripTime(date1);
      date2 = DateUtils.stripTime(date2);
    }
    return date1 < date2;
  }

  /**
   * Checks if a date is after another (optionally ignoring time)
   */
  static isAfter(date1: Date, date2: Date, ignoreTime = false): boolean {
    if (ignoreTime) {
      date1 = DateUtils.stripTime(date1);
      date2 = DateUtils.stripTime(date2);
    }
    return date1 > date2;
  }

  /**
   * Returns the difference in days between two dates
   */
  static diffInDays(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff =
      DateUtils.stripTime(date1).getTime() -
      DateUtils.stripTime(date2).getTime();
    return Math.round(diff / msPerDay);
  }

  /**
   * Checks if a date is expired (before now)
   */
  static isExpired(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Converts a Date to ISO string (date only)
   */
  static toISODate(date: Date): string {
    return DateUtils.stripTime(date).toISOString().split('T')[0];
  }

  /**
   * Get current date with time stripped
   */
  static today(): Date {
    return DateUtils.stripTime(new Date());
  }
}
