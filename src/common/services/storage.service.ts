import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient | null = null;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'stackr-dev');
    
    // Initialize Supabase client if credentials are available
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  private ensureInitialized(): void {
    if (!this.supabase) {
      throw new BadRequestException(
        'Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'avatars',
  ): Promise<string> {
    this.ensureInitialized();

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Validate file size (512 KB = 512 * 1024 bytes)
    const maxSize = 512 * 1024; // 512 KB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 512 KB');
    }

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase!.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = this.supabase!.storage.from(this.bucketName).getPublicUrl(fileName);

    return publicUrl;
  }

  async deleteImage(fileUrl: string): Promise<void> {
    if (!this.supabase) {
      return; // Silently skip if not configured
    }

    try {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((part) => part === this.bucketName);
      if (bucketIndex === -1) {
        return; // Not a Supabase URL, skip deletion
      }
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      await this.supabase.storage.from(this.bucketName).remove([filePath]);
    } catch (error) {
      // Silently fail if deletion doesn't work
      console.error('Failed to delete image:', error);
    }
  }
}

