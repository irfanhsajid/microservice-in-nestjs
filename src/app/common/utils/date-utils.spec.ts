import { DateUtils } from './date-utils';

describe('DateUtils', () => {
  const fixedDate = new Date('2025-06-25T15:30:00Z');

  it('should strip time', () => {
    const result = DateUtils.stripTime(fixedDate);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('should add days correctly', () => {
    const result = DateUtils.addDays(fixedDate, 10);
    expect(result.getDate()).toBe(5); // 25 + 10 = July 5
    expect(result.getMonth()).toBe(6); // July
  });

  it('should subtract days correctly', () => {
    const result = DateUtils.subtractDays(fixedDate, 5);
    expect(result.getDate()).toBe(20); // 25 - 5
  });

  it('should detect same date ignoring time', () => {
    const date1 = new Date('2025-06-25T00:00:00Z');
    const date2 = new Date('2025-06-25T00:00:00Z');
    expect(DateUtils.isSameDate(date1, date2)).toBe(true);
  });

  it('should check if a date is before another', () => {
    const d1 = new Date('2025-06-01');
    const d2 = new Date('2025-06-25');
    expect(DateUtils.isBefore(d1, d2)).toBe(true);
  });

  it('should check if a date is after another', () => {
    const d1 = new Date('2025-07-01');
    const d2 = new Date('2025-06-25');
    expect(DateUtils.isAfter(d1, d2)).toBe(true);
  });

  it('should return correct difference in days', () => {
    const d1 = new Date('2025-06-30');
    const d2 = new Date('2025-06-25');
    expect(DateUtils.diffInDays(d1, d2)).toBe(5);
  });

  it('should return true if date is expired', () => {
    const expiredDate = new Date('2000-01-01');
    expect(DateUtils.isExpired(expiredDate)).toBe(true);
  });

  it('should return ISO date string', () => {
    const iso = DateUtils.toISODate(new Date('2025-12-15T10:30:00'));
    expect(iso).toBe('2025-12-15');
  });

  it("should return today's date without time", () => {
    const today = new Date();
    const stripped = DateUtils.today();

    expect(stripped.getFullYear()).toBe(today.getFullYear());
    expect(stripped.getMonth()).toBe(today.getMonth());
    expect(stripped.getDate()).toBe(today.getDate());
  });
});
