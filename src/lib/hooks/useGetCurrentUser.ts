import type { ISessionUser } from "@lib/types/user.type"
import { useRouteContext } from "@tanstack/react-router"

const useGetCurrentUser = () => {
  const { user } = useRouteContext({ from: "__root__" })
  if (user) {
    return user
  }

  return {
    email: "",
    id: "",
    image: null,
    name: "",
  } as ISessionUser
}

export default useGetCurrentUser
