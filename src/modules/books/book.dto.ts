import { IsString, IsUUID } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  ISBN: string;
}

export class BookDto {
  @IsString()
  title: string;
}

export class bookQueryDto {
  @IsUUID()
  bookId: string;
}

export class bookParamDto {
  @IsString()
  bookId: string;
}
