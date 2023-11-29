import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookService } from '../books/book.service';
import { BookDto, CreateBookDto, bookParamDto, bookQueryDto } from './book.dto';

@Controller('books')
export class BookController {
  @Inject(BookService)
  private readonly service: BookService;

  @Post('/create')
  public async createBook(@Body() body: CreateBookDto) {
    const data = await this.service.createBook(body);
    return { data, message: 'Book added succesfully' };
  }

  @Get('/')
  public async getBooksDetails() {
    const data = await this.service.getBooks();
    return { data, message: 'success' };
  }

  @Get('/:bookId')
  public async getBookDetails(@Param() param: bookParamDto) {
    const { bookId } = param;
    const data = await this.service.getSingleBook(bookId);
    return { data, message: 'success' };
  }

  @Patch('/update')
  public async updateBook(@Query() query: bookQueryDto, @Body() body: BookDto) {
    const { bookId } = query;
    await this.service.updateBook(bookId, body?.title);
    return { message: 'updated successfully' };
  }

  @Delete('/delete')
  public async deleteBook(@Query() query: bookQueryDto) {
    const { bookId } = query;
    await this.service.deleteBook(bookId);
    return { message: 'book deleted successfully' };
  }
}
