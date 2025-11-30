import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { CustomSignUpCard } from "@/components/auth/custom-sign-up-card";

const SignUpPage = async () => {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return <CustomSignUpCard />;
};

export default SignUpPage;
