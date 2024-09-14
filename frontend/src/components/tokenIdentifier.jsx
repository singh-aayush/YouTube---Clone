import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAxios = () => {
  const navigate = useNavigate();

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log("error", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  return axios;
};

export default useAxios;
