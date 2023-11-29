import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from '../books/book.controller';
import { BookService } from '../books/book.service';
import {
  BookDto,
  CreateBookDto,
  bookParamDto,
  bookQueryDto,
} from '../books/book.dto';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: {
            createBook: jest.fn(),
            getBooks: jest.fn(),
            deleteBook: jest.fn(),
            getSingleBook: jest.fn(),
            updateBook: jest.fn(),
          },
        },
      ],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  describe('createBook', () => {
    it('should create a book and return the specified data format', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        ISBN: '9780132350884',
      };

      const expectedData = {
        title: 'Test booksdasdfsasdSS',
        ISBN: '9780132350884',
      };

      jest.spyOn(bookService, 'createBook').mockResolvedValue(expectedData);

      const result = await bookController.createBook(createBookDto);

      expect(result).toEqual({
        data: expectedData,
        message: 'Book added succesfully',
      });
    });

    it('should return an error for invalid ISBN', async () => {
      // CreateBookDto with invalid ISBN
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        ISBN: '123',
      };

      jest.spyOn(bookService, 'createBook').mockImplementation(() => {
        throw new Error('Invalid ISBN');
      });

      try {
        await bookController.createBook(createBookDto);
      } catch (error) {
        expect(error.message).toBe('Invalid ISBN');
      }
      expect(bookService.createBook).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('getBooksDetails', () => {
    it('should return an array of books', async () => {
      const expectedBooksData = [
        {
          title: 'Test bookSS',
          ISBN: 'jhsgf74634cb3485SDFScb3',
        },
        {
          title: 'Test booksdfsasdSS',
          ISBN: 'jhsgf74634cb3sa485SsdfsDFScb3',
        },
      ];

      // Mock the getBooks method to return the expected data
      jest.spyOn(bookService, 'getBooks').mockResolvedValue(expectedBooksData);

      const result = await bookController.getBooksDetails();
      expect(result).toEqual({ data: expectedBooksData, message: 'success' });
    });
  });

  describe('Retrieving Single Book Details', () => {
    it('should return details of a single book', async () => {
      const sampleBookId = 'sample_book_id';
      const singleBookData = {
        id: sampleBookId,
        title: 'Sample Book',
        ISBN: '1234567890',
      };
      jest
        .spyOn(bookService, 'getSingleBook')
        .mockResolvedValue(singleBookData);

      const result = await bookController.getBookDetails({
        bookId: sampleBookId,
      } as bookParamDto);
      expect(result).toEqual({ data: singleBookData, message: 'success' });
    });
  });

  describe('Updating a Book', () => {
    it('should update the book successfully', async () => {
      const bookId = 'sample_book_id';
      const updatedTitle = 'Updated Book Title';
      jest.spyOn(bookService, 'updateBook').mockResolvedValue({});

      const queryData: bookQueryDto = { bookId };
      const bodyData: BookDto = { title: updatedTitle };
      const result = await bookController.updateBook(queryData, bodyData);

      expect(bookService.updateBook).toHaveBeenCalledWith(bookId, updatedTitle);

      expect(result).toEqual({ message: 'updated successfully' });
    });
  });

  describe('Deleting a Book', () => {
    it('should delete the book successfully', async () => {
      const bookId = 'sample_book_id';

      const queryData: bookQueryDto = { bookId };
      const result = await bookController.deleteBook(queryData);

      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId);
      expect(result).toEqual({ message: 'book deleted successfully' });
    });
  });
});
