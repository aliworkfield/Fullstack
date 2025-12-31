import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/client";
import keycloak from "@/keycloak";

// Define UserPublic type to match backend schema
export type UserPublic = {
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
  keycloak_user_id: string;
  id: string;
};

export default function useAuth() {
  const { data: user, isLoading, isError, error, refetch } = useQuery<UserPublic>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await UsersService.readUserMe();
      return response as UserPublic;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      await keycloak.logout();
      // Clear any cached user data
      refetch();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user,
    isLoading,
    isError,
    error,
    logout,
    isAuthenticated: !!user && !isLoading,
  };
}