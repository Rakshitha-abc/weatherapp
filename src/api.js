import axios from 'axios';

const API_KEY = '9d5763138301c0ffbb2b1adfa4518a70';
const BASE_URL = 'https://api.weatherstack.com';

const apiClient = axios.create({
    baseURL: BASE_URL,
    params: {
        access_key: API_KEY,
    },
});

export const weatherApi = {
    getCurrent: async (query, units = 'm') => {
        const { data } = await apiClient.get('/current', { params: { query, units } });
        if (data.error) throw new Error(data.error.info);
        return data;
    },

    getForecast: async (query, days = 7) => {
        const { data } = await apiClient.get('/forecast', { params: { query, forecast_days: days } });
        if (data.error) throw new Error(data.error.info);
        return data;
    },

    getHistorical: async (query, date) => {
        const { data } = await apiClient.get('/historical', { params: { query, historical_date: date } });
        if (data.error) throw new Error(data.error.info);
        return data;
    },

    getMarine: async (query) => {
        const { data } = await apiClient.get('/marine', { params: { query } });
        if (data.error) throw new Error(data.error.info);
        return data;
    },

    autocomplete: async (query) => {
        const { data } = await apiClient.get('/autocomplete', { params: { query } });
        if (data.error) throw new Error(data.error.info);
        return data;
    },
};
