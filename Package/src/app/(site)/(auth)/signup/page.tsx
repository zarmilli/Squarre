import SignUp from "@/app/components/auth/sign-up";
import { Metadata } from "../../../../../Package/node_modules/next";

export const metadata: Metadata = {
  title:
    "Sign Up | Awake Agency",
};

const SignupPage = () => {
  return (
    <>
      <SignUp />
    </>
  );
};

export default SignupPage;
