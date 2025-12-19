import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  async create(createProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    // Check if profile already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { userId: createProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile for this user already exists');
    }

    // Check if username is taken
    if (createProfileDto.username) {
      const existingUsername = await this.profileRepository.findOne({
        where: { username: createProfileDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    const profile = this.profileRepository.create(createProfileDto);
    return await this.profileRepository.save(profile);
  }

  async findOne(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return profile;
  }

  async findByUsername(username: string): Promise<UserProfile | null> {
    return await this.profileRepository.findOne({
      where: { username },
      relations: ['user'],
    });
  }

  async update(userId: string, updateProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findOne(userId);

    // Check if username is being changed and if it's taken
    if (updateProfileDto.username && updateProfileDto.username !== profile.username) {
      const existingUsername = await this.findByUsername(updateProfileDto.username);
      if (existingUsername && existingUsername.userId !== userId) {
        throw new ConflictException('Username is already taken');
      }
    }

    Object.assign(profile, updateProfileDto);
    return await this.profileRepository.save(profile);
  }

  async remove(userId: string): Promise<void> {
    const profile = await this.findOne(userId);
    await this.profileRepository.remove(profile);
  }
}

