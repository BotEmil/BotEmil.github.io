import axios from 'axios';
import HttpConfig from '../configs/HttpConfig'

export default {
    get() {
        return axios.get(HttpConfig.baseUrl);
    }
};