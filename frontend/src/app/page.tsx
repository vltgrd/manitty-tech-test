import { auth0 } from '@/lib/auth0'

export default async function Login() {
  const session = await auth0.getSession()

  // If the user is already logged in, redirect to the dashboard
  if (session) {
    return <script>{`window.location.href = '/dashboard';`}</script>
  }

  // otherwise, show the login page -> /auth/login
  return <script>{`window.location.href = '/auth/login';`}</script>
}
