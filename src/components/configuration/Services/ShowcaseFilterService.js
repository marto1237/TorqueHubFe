import showcaseAPI from '../showcaseAPI';

const ShowcaseFilterService = {
    filterShowcases: (filters, page = 0, size = 10) => {
        const params = new URLSearchParams({ ...filters, page, size });
        return showcaseAPI.get(`/showcases/filter?${params.toString()}`).then((res) => res.data);
    },
};

export default ShowcaseFilterService;
