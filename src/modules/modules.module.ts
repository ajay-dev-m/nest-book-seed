import { Module } from '@nestjs/common';
import { BookModule } from './books/books.module';

@Module({
  imports: [BookModule],
})
export class BaseModule {}
