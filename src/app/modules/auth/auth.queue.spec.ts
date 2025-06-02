import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { AuthConsumer } from './auth.queue';

describe('AuthConsumer', () => {
  let authConsumer: AuthConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthConsumer],
    }).compile();

    authConsumer = module.get<AuthConsumer>(AuthConsumer);
  });

  describe('process', () => {
    it('should process send-otp job and log data and token', async () => {
      // Arrange
      const mockJob = {
        name: 'send-otp',
        data: { email: 'test@example.com', name: 'Test User' },
      } as Job;
      const mockToken = 'mock-token';
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      // Act
      await authConsumer.process(mockJob, mockToken);

      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith('task run');
      expect(consoleInfoSpy).toHaveBeenCalledWith('token', mockToken);
      expect(consoleInfoSpy).toHaveBeenCalledWith(mockJob.data);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(3);

      // Clean up
      consoleInfoSpy.mockRestore();
    });

    it('should handle unknown job name gracefully', async () => {
      // Arrange
      const mockJob = {
        name: 'unknown-job',
        data: { email: 'test@example.com' },
      } as Job;
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      // Act
      await authConsumer.process(mockJob);

      // Assert
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      await expect(authConsumer.process(mockJob)).resolves.toBeUndefined();

      // Clean up
      consoleInfoSpy.mockRestore();
    });

    it('should process send-otp job without token', async () => {
      // Arrange
      const mockJob = {
        name: 'send-otp',
        data: { email: 'test@example.com', name: 'Test User' },
      } as Job;
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      // Act
      await authConsumer.process(mockJob);

      // Assert
      expect(consoleInfoSpy).toHaveBeenCalledWith('task run');
      expect(consoleInfoSpy).toHaveBeenCalledWith('token', undefined);
      expect(consoleInfoSpy).toHaveBeenCalledWith(mockJob.data);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(3);

      // Clean up
      consoleInfoSpy.mockRestore();
    });
  });
});
