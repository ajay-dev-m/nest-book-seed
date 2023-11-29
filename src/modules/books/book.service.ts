import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './book.dto';
import { PrismaService } from '../../utils/prisma/prisma';
import { book } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  public async createBook(body: CreateBookDto) {
    try {
      await this.isValidISBN13(body.ISBN);
      const isExist = await this.prisma.book.findFirst({
        where: {
          ISBN: body.ISBN,
        },
      });
      if (isExist) {
        throw new ConflictException('already exist ISBN');
      }

      const insertBookData: Partial<book> = await this.prisma.book.create({
        data: {
          title: body.title,
          ISBN: body.ISBN,
        },
        select: {
          title: true,
          ISBN: true,
        },
      });
      return insertBookData;
    } catch (e) {
      if (e instanceof ConflictException || e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException('sorry something went wrong');
    }
  }

  public async getBooks() {
    const books: Partial<book>[] = await this.prisma.book.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        title: true,
        ISBN: true,
      },
    });
    return books;
  }

  public async getSingleBook(bookId) {
    const book: Partial<book> = await this.prisma.book.findFirst({
      where: {
        id: bookId,
        is_deleted: false,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  public async deleteBook(id: string) {
    try {
      await this.prisma.book.update({
        where: {
          id,
          is_deleted: false,
        },
        data: {
          is_deleted: true,
        },
      });
    } catch (e) {
      throw new NotFoundException('Book not found');
    }
  }

  public async updateBook(id: string, title: string) {
    try {
      const updatedBook: Partial<book> = await this.prisma.book.update({
        where: {
          id,
          is_deleted: false,
        },
        data: {
          title,
        },
        select: {
          title: true,
          ISBN: true,
        },
      });

      return updatedBook;
    } catch (e) {
      throw new NotFoundException('Book not found');
    }
  }

  public async isValidISBN13(isbn: string) {
    // Remove hyphens if present
    isbn = isbn.replace(/-/g, '');

    // Check if it's a 13-digit number
    if (!/^\d{13}$/.test(isbn)) {
      throw new BadRequestException('Invalid ISBN');
    }

    // Calculate the checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Number(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }

    const checksum = (10 - (sum % 10)) % 10;

    if (Number(isbn[12]) !== checksum) {
      throw new BadRequestException('Invalid ISBN');
    }

    // Check if the last digit matches the calculated checksum
    return true;
  }
}
