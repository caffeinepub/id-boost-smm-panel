import { useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext } from "react";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";

interface AppContextType {
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  refetchProfile: () => void;
}

const AppContext = createContext<AppContextType>({
  userProfile: null,
  isAdmin: false,
  isLoading: true,
  refetchProfile: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const adminQuery = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  const isLoading =
    isFetching || profileQuery.isLoading || adminQuery.isLoading;

  return (
    <AppContext.Provider
      value={{
        userProfile: profileQuery.data ?? null,
        isAdmin: adminQuery.data ?? false,
        isLoading,
        refetchProfile: profileQuery.refetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
