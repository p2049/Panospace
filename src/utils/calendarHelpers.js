/**
 * Generate calendar days for a given month
 * @param {Date} currentDate - The date representing the current month/year to display
 * @returns {Array} Array of day objects with date and isCurrentMonth properties
 */
export const generateCalendarDays = (currentDate) => {
    const days = [];

    // Get month boundaries
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const firstDayOfMonth = monthStart.getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Previous month days to fill the first week
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
            isCurrentMonth: false
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
            isCurrentMonth: true
        });
    }

    // Next month days to fill grid (6 rows * 7 days = 42 total cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
            isCurrentMonth: false
        });
    }

    return days;
};
