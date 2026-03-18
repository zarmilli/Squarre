
import Signin from "@/app/components/auth/sign-in";
import { Metadata } from "../../../../../Package/node_modules/next";

export const metadata: Metadata = {
  title:
    "Sign In | Awake Agency",
};

const SigninPage = () => {
  return (
    <>
      <Signin />
    </>
  );
};

export default SigninPage;
