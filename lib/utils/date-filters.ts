export type DateFilter = 
  | "ALL" 
  | "TODAY" 
  | "WEEK" 
  | "MONTH" 
  | "YEAR" 
  | "NO_DEADLINE" 
  | "PAST";

export const isWithinInterval = (dateStr: string | Date | null, range: DateFilter) => {
  if (range === "ALL") return true;
  
  // Handle No Deadline case
  if (range === "NO_DEADLINE") return dateStr === null;
  
  // If we're looking for any specific date range but the date is null, it's a mismatch
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const now = new Date();
  
  // Strip time for clean "Today" comparison
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  switch (range) {
    case "PAST":
      return date < startOfToday; 
      
    case "TODAY":
      return date >= startOfToday && date < endOfToday;
      
    case "WEEK": {
      const nextWeek = new Date(startOfToday);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return date >= startOfToday && date < nextWeek;
    }
    case "MONTH": {
      const nextMonth = new Date(startOfToday);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return date >= startOfToday && date < nextMonth;
    }
    case "YEAR": {
      const nextYear = new Date(startOfToday);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return date >= startOfToday && date < nextYear;
    }
    default:
      return true;
  }
};