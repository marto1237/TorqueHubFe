import { formatDistanceToNow } from 'date-fns';

export const timeAgo = (date) => {
    if (!date) {
        return 'Unknown time'; // Handle case where date is null or undefined
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return 'Unknown time'; // Handle invalid date format
    }

    return formatDistanceToNow(parsedDate, { addSuffix: true });
};