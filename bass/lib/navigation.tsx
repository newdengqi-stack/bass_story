import {
  Link as RouterLink,
  useNavigate,
  type LinkProps,
} from 'react-router-dom'
import { forwardRef, useMemo } from 'react'

const Link = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, 'to'> & { href: string }
>(function Link({ href, ...props }, ref) {
  return <RouterLink ref={ref} to={href} {...props} />
})
export default Link
export function useRouter() {
  const navigate = useNavigate()
  return useMemo(
    () => ({
      push: (path: string) => navigate(path),
      replace: (path: string) => navigate(path, { replace: true }),
    }),
    [navigate],
  )
}
