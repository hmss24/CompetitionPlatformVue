import axios from "axios"

axios.defaults.timeout = 5000;
axios.interceptors.request.use(
  response => {
    if((response.data.code ?? 200) == 200) return Promise.resolve(response);
    return Promise.resolve(response);
  },
  error => {
  }
)