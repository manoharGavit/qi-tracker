export type AuthUser = {
  id: string | number
  email: string
  name: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginCredentials = {
  email: string
  password: string
}
