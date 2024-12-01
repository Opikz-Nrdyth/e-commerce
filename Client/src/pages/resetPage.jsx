import { Link, useParams } from "react-router-dom";
import ResetPassword from "../components/common/resetPassword";
import SuccessReset from "../components/common/successReset";
import ConfirmEmail from "../components/common/confirmEmail";

const ResetPage = ({ userData }) => {
  const params = useParams();
  const path = params["*"];
  switch (path) {
    case "":
      return <ConfirmEmail />;
    case "password":
      return <ResetPassword />;
    case "success":
      return <SuccessReset />;
    default:
      return <ConfirmEmail />;
  }
};

export default ResetPage;
