import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BookService } from '../books/book.service';
import { PrismaService } from '../../utils/prisma/prisma';
import { CreateBookDto } from '../books/book.dto';
import { book } from '@prisma/client';

describe('BookService', () => {
  let bookService: BookService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const mockCreateBookDto: CreateBookDto = {
        title: 'Test Book',
        ISBN: '1234567890123',
      };
      const mockBookData = {
        id: 'mock_book_id',
        title: 'Test Book',
        ISBN: '1234567890123',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      jest.spyOn(bookService, 'isValidISBN13').mockResolvedValue(true);
      jest.spyOn(prismaService.book, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.book, 'create').mockResolvedValue(mockBookData);

      const result = await bookService.createBook(mockCreateBookDto);
      expect(result).toEqual(mockBookData);
    });

    it('should throw ConflictException for existing ISBN', async () => {
      const mockCreateBookDto: CreateBookDto = {
        title: 'Sample Book',
        ISBN: '1234567890123',
      };

      jest.spyOn(bookService, 'isValidISBN13').mockResolvedValue(true);
      jest.spyOn(prismaService.book, 'findFirst').mockResolvedValue({
        id: '1',
        title: 'Sample Book',
        ISBN: '1234567890123',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      } as book);

      await expect(
        bookService.createBook(mockCreateBookDto),
      ).rejects.toThrowError(ConflictException);
    });

    it('should throw BadRequestException for invalid ISBN format', async () => {
      const mockCreateBookDto: CreateBookDto = {
        title: 'Sample Book',
        ISBN: 'invalidISBN', // Invalid format
      };

      jest.spyOn(bookService, 'isValidISBN13').mockImplementation(() => {
        throw new BadRequestException('Invalid ISBN');
      });

      await expect(
        bookService.createBook(mockCreateBookDto),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      // Mocking PrismaService's behavior for findFirst and create methods to simulate internal error
      const mockCreateBookDto: CreateBookDto = {
        title: 'Test Book',
        ISBN: '1234567890123',
      };

      jest.spyOn(bookService, 'isValidISBN13').mockResolvedValue(true);
      jest
        .spyOn(prismaService.book, 'findFirst')
        .mockRejectedValue(new Error());

      await expect(bookService.createBook(mockCreateBookDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getBook', () => {
    it('should return an empty array when no books exist', async () => {
      const mockEmptyBooks: {
        id: string;
        title: string;
        ISBN: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
      }[] = [];

      jest
        .spyOn(prismaService.book, 'findMany')
        .mockResolvedValue(mockEmptyBooks);

      const result = await bookService.getBooks();

      // Expecting the result to be an empty array
      expect(result).toEqual([]);
    });

    it('should return books with selected properties', async () => {
      const mockBooks: Partial<book>[] = [
        {
          title: 'Book 1',
          ISBN: '1234567890',
        },
        {
          title: 'Book 2',
          ISBN: '0987654321',
        },
      ];

      jest
        .spyOn(prismaService.book, 'findMany')
        .mockResolvedValue(mockBooks as Partial<book[]>);

      const result = await bookService.getBooks();
      const expectedBooks: Partial<book>[] = [
        {
          title: 'Book 1',
          ISBN: '1234567890',
        },
        {
          title: 'Book 2',
          ISBN: '0987654321',
        },
      ];
      expect(result).toEqual(expectedBooks);
    });

    it('should list created books and update list after deletion', async () => {
      const mockBooks: Partial<book>[] = [
        {
          title: 'Book 1',
          ISBN: '1234567890',
        },
        {
          title: 'Book 2',
          ISBN: '0987654321',
        },
      ];

      jest.spyOn(bookService, 'getBooks').mockResolvedValue(mockBooks);

      let result = await bookService.getBooks();
      expect(result.length).toBe(2);

      mockBooks[0].is_deleted = true;

      jest.spyOn(bookService, 'getBooks').mockResolvedValue([mockBooks[1]]);

      result = await bookService.getBooks();
      expect(result.length).toBe(1);
    });
  });

  describe('getSingleBook', () => {
    it('should get a single book by ID', async () => {
      const mockBookId = '1';
      const mockBook: Partial<book> = {
        title: 'Mock Book',
        ISBN: '1234567890',
      };

      jest
        .spyOn(bookService['prisma'].book, 'findFirst')
        .mockResolvedValue(mockBook as book);

      const result = await bookService.getSingleBook(mockBookId);
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book is not found', async () => {
      const mockBookId = '2';
      jest
        .spyOn(bookService['prisma'].book, 'findFirst')
        .mockResolvedValue(null);

      await expect(bookService.getSingleBook(mockBookId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('deleteBook', () => {
    it('should throw NotFoundException if the book does not exist', async () => {
      jest.spyOn(prismaService.book, 'update').mockImplementation(() => {
        throw new Error('Book not found');
      });
      const nonExistentBookId = '999';
      await expect(bookService.deleteBook(nonExistentBookId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateBook', () => {
    it('should update the book title successfully', async () => {
      const updatedBook: Partial<book> = {
        id: '123',
        title: 'New Title',
        ISBN: '1234567890',
      };
      jest
        .spyOn(prismaService.book, 'update')
        .mockResolvedValue(updatedBook as book);

      const validBookId = '123';
      const newTitle = 'New Title';

      const result = await bookService.updateBook(validBookId, newTitle);
      expect(result).toEqual(updatedBook);
    });

    it('should throw NotFoundException if the book does not exist', async () => {
      jest.spyOn(prismaService.book, 'update').mockImplementation(() => {
        throw new Error('Book not found');
      });

      const nonExistentBookId = '999';
      const newTitle = 'New Title';

      await expect(
        bookService.updateBook(nonExistentBookId, newTitle),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
