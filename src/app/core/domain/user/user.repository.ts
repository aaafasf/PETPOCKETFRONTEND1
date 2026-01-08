import { User } from './user.model';
import { CreateUserDto } from '../../../infrastructure/user/create-user.dto';

export abstract class UserRepository {
  abstract getAll(): Promise<User[]>;
  abstract create(payload: CreateUserDto): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
