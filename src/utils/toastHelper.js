import { toast , Slide } from "react-toastify";

const defaultOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Slide,
};

export const showToast = (type, message, options = {}) => {
  const config = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "info":
      toast.info(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    default:
      toast(message, config);
  }
};