import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { CustomSignInCard } from "@/components/auth/custom-sign-in-card";

const SignInPage = async () => {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return <CustomSignInCard />;
};

export default SignInPage;
