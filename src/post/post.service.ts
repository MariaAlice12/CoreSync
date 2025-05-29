import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
    constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

 create(dto: CreatePostDto) {
    const post = this.postRepo.create(dto);
    return this.postRepo.save(post);
  }

  findAll() {
    return this.postRepo.find();
  }

  findOne(id: number) {
    return this.postRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdatePostDto) {
    return this.postRepo.update(id, dto);
  }

  remove(id: number) {
    return this.postRepo.delete(id);
  }
}
