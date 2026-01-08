export interface CreateUserDto {
  nameUsers: string;
  phoneUser?: string | null;
  emailUser: string;
  userName: string;
  passwordUser: string;
  roles: string[];
}
