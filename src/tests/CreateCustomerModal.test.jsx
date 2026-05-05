import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
import api from '../api/axiosInstance';
// Импортируем замокканную функцию, чтобы проверять её вызовы
import { logActivity } from '../utils/logger'; 

// Мокаем API (автоматически заменяет методы на vi.fn())
vi.mock('../api/axiosInstance');

// Мокаем logger правильно
vi.mock('../utils/logger', () => ({
  logActivity: vi.fn(),
}));

describe('CreateCustomerModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCustomerCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('не должен рендериться когда isOpen = false', () => {
    render(
      <CreateCustomerModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onCustomerCreated={mockOnCustomerCreated} 
      />
    );
    expect(screen.queryByText(/новый клиент/i)).not.toBeInTheDocument();
  });

  it('должен рендериться когда isOpen = true', async () => { // добавили async
  render(
    <CreateCustomerModal 
      isOpen={true} 
      onClose={mockOnClose} 
      onCustomerCreated={mockOnCustomerCreated} 
    />
  );

  // findByText возвращает промис и ждет появления элемента
  const title = await screen.findByText(/новый клиент/i);
  expect(title).toBeInTheDocument();
  
  expect(screen.getByLabelText(/фио/i)).toBeInTheDocument();
});

  it('должен закрываться при клике на кнопку отмены', () => {
    render(<CreateCustomerModal isOpen={true} onClose={mockOnClose} onCustomerCreated={mockOnCustomerCreated} />);

    const cancelButton = screen.getByText(/отмена/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('должен создавать клиента и логировать действие', async () => {
    // Настраиваем успешный ответ API
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    render(<CreateCustomerModal isOpen={true} onClose={mockOnClose} onCustomerCreated={mockOnCustomerCreated} />);

    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/фио/i), { target: { value: 'Иван Иванов' } });
    fireEvent.click(screen.getByText(/создать/i));

    await waitFor(() => {
      // Проверка API
      expect(api.post).toHaveBeenCalledWith('/customers', expect.objectContaining({
        fullName: 'Иван Иванов'
      }));
      
      // Проверка логирования
      expect(logActivity).toHaveBeenCalledWith(
        'Клиенты', 
        'Создан новый клиент: Иван Иванов'
      );
      
      expect(mockOnCustomerCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('должен обрабатывать ошибки при создании', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

    render(<CreateCustomerModal isOpen={true} onClose={mockOnClose} onCustomerCreated={mockOnCustomerCreated} />);

    fireEvent.change(screen.getByLabelText(/фио/i), { target: { value: 'Тест' } });
    fireEvent.click(screen.getByText(/создать/i));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Ошибка при создании клиента');
    });

    alertSpy.mockRestore();
  });
});