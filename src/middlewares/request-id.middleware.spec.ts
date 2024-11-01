import { RequestIdMiddleware } from './request-id.middleware';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  const mockNext = jest.fn();

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockNext.mockClear();
  });

  it('should add x-request-id if it does not exist', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    middleware.use(req, res, mockNext);

    expect(req.headers['x-request-id']).toBe(mockUuid);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not overwrite existing x-request-id', () => {
    const existingRequestId = 'existing-request-id';
    const req = { headers: { 'x-request-id': existingRequestId } } as any;
    const res = {} as any;

    middleware.use(req, res, mockNext);

    expect(req.headers['x-request-id']).toBe(existingRequestId);
    expect(mockNext).toHaveBeenCalled();
  });
});
