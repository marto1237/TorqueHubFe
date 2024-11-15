import api from '../api';

const FilterService = {
    filterQuestions: (selectedTags = [], noAnswers, noAcceptedAnswer, sortOption, page = 0, size = 10) => {
        const baseURL = '/question/filter';
        
        const searchParams = new URLSearchParams();
        
        if (selectedTags && selectedTags.length > 0) {
            selectedTags.forEach(tag => searchParams.append('tags', tag));
        }
        if (noAnswers) searchParams.append('noAnswers', noAnswers);
        if (noAcceptedAnswer) searchParams.append('noAcceptedAnswer', noAcceptedAnswer);
        if (sortOption) searchParams.append('sortOption', sortOption || 'newest');
        searchParams.append('page', page);
        searchParams.append('size', size);

        const fullURL = `${baseURL}?${searchParams.toString()}`;
        console.log("Full API Request URL:", fullURL);

        return api.get(fullURL)
            .then(response => {
                console.log("API Response:", response.data);
                return response.data;
            })
            .catch(error => {
                console.error("API Error:", error);
                return Promise.reject(error);
            });
    }
};

export default FilterService;