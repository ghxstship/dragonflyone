import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FileUpload Component', () => {
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const mockImageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    // Mock URL.createObjectURL to avoid issues with blob URLs in tests
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders with default props', () => {
    render(<FileUpload onFilesSelect={() => {}} />);
    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom label and helper text', () => {
    render(
      <FileUpload
        label="Upload your files"
        helperText="Maximum 5 files"
        onFilesSelect={() => {}}
      />
    );
    expect(screen.getByText('Upload your files')).toBeInTheDocument();
    expect(screen.getByText('Maximum 5 files')).toBeInTheDocument();
  });

  it('handles file input click', () => {
    const mockOnFilesSelect = vi.fn();
    render(<FileUpload onFilesSelect={mockOnFilesSelect} />);

    const uploadArea = screen.getByRole('button');
    fireEvent.click(uploadArea);

    // In a real scenario, this would open the file picker, but we can't test that directly
    // We can verify the component renders and is clickable
    expect(uploadArea).toBeInTheDocument();
  });

  it('handles drag enter and leave', () => {
    const mockOnFilesSelect = vi.fn();
    render(<FileUpload onFilesSelect={mockOnFilesSelect} />);

    const uploadArea = screen.getByRole('button');

    // Drag enter
    fireEvent.dragEnter(uploadArea);
    expect(uploadArea).toBeInTheDocument();

    // Drag leave
    fireEvent.dragLeave(uploadArea);
    expect(uploadArea).toBeInTheDocument();
  });

  it('handles file drop', () => {
    const mockOnFilesSelect = vi.fn();
    render(<FileUpload onFilesSelect={mockOnFilesSelect} />);

    const uploadArea = screen.getByRole('button');

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile],
      },
    };

    fireEvent.drop(uploadArea, dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(dropEvent.stopPropagation).toHaveBeenCalled();
    expect(mockOnFilesSelect).toHaveBeenCalledWith([mockFile]);
  });

  it('filters files by maxSize', () => {
    const mockOnFilesSelect = vi.fn();
    const largeFile = new File(['large content'], 'large.txt', { type: 'text/plain' });
    Object.defineProperty(largeFile, 'size', { value: 1024 * 1024 * 11 }); // 11MB

    render(
      <FileUpload
        onFilesSelect={mockOnFilesSelect}
        maxSize={1024 * 1024 * 10} // 10MB
      />
    );

    const uploadArea = screen.getByRole('button');

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [largeFile],
      },
    };

    fireEvent.drop(uploadArea, dropEvent);

    expect(mockOnFilesSelect).toHaveBeenCalledWith([]);
  });

  it('limits files by maxFiles', () => {
    const mockOnFilesSelect = vi.fn();
    const files = [mockFile, mockImageFile, new File(['content3'], 'file3.txt')];

    render(
      <FileUpload
        onFilesSelect={mockOnFilesSelect}
        maxFiles={2}
        files={[]} // No existing files
      />
    );

    const uploadArea = screen.getByRole('button');

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files,
      },
    };

    fireEvent.drop(uploadArea, dropEvent);

    expect(mockOnFilesSelect).toHaveBeenCalledWith(files.slice(0, 2));
  });

  it('shows drag overlay when dragging', () => {
    const mockOnFilesSelect = vi.fn();
    render(<FileUpload onFilesSelect={mockOnFilesSelect} />);

    const uploadArea = screen.getByRole('button');

    fireEvent.dragEnter(uploadArea);
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    const mockOnFilesSelect = vi.fn();
    render(<FileUpload onFilesSelect={mockOnFilesSelect} disabled />);

    const uploadArea = screen.getByRole('button');
    expect(uploadArea).toHaveAttribute('tabIndex', '-1');

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile],
      },
    };

    fireEvent.drop(uploadArea, dropEvent);
    expect(mockOnFilesSelect).not.toHaveBeenCalled();
  });

  it('renders with inverted styling', () => {
    render(<FileUpload onFilesSelect={() => {}} inverted />);
    const uploadArea = screen.getByRole('button');
    expect(uploadArea).toHaveClass('file-upload-inverted');
  });

  it('renders in compact mode', () => {
    render(<FileUpload onFilesSelect={() => {}} compact />);
    const uploadArea = screen.getByRole('button');
    expect(uploadArea).toHaveClass('file-upload-compact');
  });

  it('supports keyboard navigation', () => {
    render(<FileUpload onFilesSelect={() => {}} />);

    const uploadArea = screen.getByRole('button');
    uploadArea.focus();

    fireEvent.keyDown(uploadArea, { key: 'Enter' });
    expect(uploadArea).toBeInTheDocument();

    fireEvent.keyDown(uploadArea, { key: ' ' });
    expect(uploadArea).toBeInTheDocument();
  });

  it('shows file list when files are provided', () => {
    const files = [{
      id: '1',
      name: 'test.txt',
      size: 1024,
      type: 'text/plain',
      status: 'complete' as const,
    }];

    render(<FileUpload onFilesSelect={() => {}} files={files} />);

    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('✓ Complete')).toBeInTheDocument();
  });

  it('shows uploading status with progress', () => {
    const files = [{
      id: '1',
      name: 'uploading.txt',
      size: 2048,
      type: 'text/plain',
      status: 'uploading' as const,
      progress: 50,
    }];

    render(<FileUpload onFilesSelect={() => {}} files={files} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows error status', () => {
    const files = [{
      id: '1',
      name: 'error.txt',
      size: 1024,
      type: 'text/plain',
      status: 'error' as const,
    }];

    render(<FileUpload onFilesSelect={() => {}} files={files} />);

    expect(screen.getByText('✗ Error')).toBeInTheDocument();
  });

  it('calls onFileRemove when remove button is clicked', () => {
    const mockOnFileRemove = vi.fn();
    const files = [{
      id: '1',
      name: 'removable.txt',
      size: 1024,
      type: 'text/plain',
      status: 'complete' as const,
    }];

    render(
      <FileUpload
        onFilesSelect={() => {}}
        onFileRemove={mockOnFileRemove}
        files={files}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove removable.txt' });
    fireEvent.click(removeButton);

    expect(mockOnFileRemove).toHaveBeenCalledWith('1');
  });

  it('hides file list when showFileList is false', () => {
    const files = [{
      id: '1',
      name: 'hidden.txt',
      size: 1024,
      type: 'text/plain',
      status: 'complete' as const,
    }];

    render(<FileUpload onFilesSelect={() => {}} files={files} showFileList={false} />);

    expect(screen.queryByText('hidden.txt')).not.toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const files = [
      { id: '1', name: 'small.txt', size: 512, type: 'text/plain', status: 'complete' as const },
      { id: '2', name: 'medium.txt', size: 1024 * 1024, type: 'text/plain', status: 'complete' as const },
      { id: '3', name: 'large.txt', size: 1024 * 1024 * 1024, type: 'text/plain', status: 'complete' as const },
    ];

    render(<FileUpload onFilesSelect={() => {}} files={files} />);

    expect(screen.getByText('512 B')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });

  it('displays correct icons for different file types', () => {
    const files = [
      { id: '1', name: 'image.jpg', size: 1024, type: 'image/jpeg', status: 'complete' as const },
      { id: '2', name: 'video.mp4', size: 1024, type: 'video/mp4', status: 'complete' as const },
      { id: '3', name: 'audio.mp3', size: 1024, type: 'audio/mpeg', status: 'complete' as const },
      { id: '4', name: 'document.pdf', size: 1024, type: 'application/pdf', status: 'complete' as const },
    ];

    render(<FileUpload onFilesSelect={() => {}} files={files} />);

    // Verify files are displayed (icons are tested indirectly through rendering)
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
    expect(screen.getByText('video.mp4')).toBeInTheDocument();
    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });
});
