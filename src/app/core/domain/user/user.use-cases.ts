import { UserRepository } from './user.repository';
import { User } from './user.model';
import { CreateUserDto } from '../../../infrastructure/user/create-user.dto';

// =======================
// GET USERS
// =======================
export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(): Promise<User[]> {
    return this.userRepository.getAll();
  }
}

// =======================
// CREATE USER
// =======================
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(dto: CreateUserDto): Promise<void> {
    return this.userRepository.create(dto);
  }
}

// =======================
// DELETE USER
// =======================
export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
