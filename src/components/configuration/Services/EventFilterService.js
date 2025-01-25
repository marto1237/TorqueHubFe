import ticktsAPI from "../ticketsAPI";

const EventFilterService = {
    filterEvents: (filters, page = 0, size = 10) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => params.append(key, v));
            } else if (value) {
                params.append(key, value);
            }
        });

        params.append("page", page);
        params.append("size", size);

        return ticktsAPI.get(`/events/filter?${params.toString()}`).then((res) => res.data);
    },
};

export default EventFilterService;
