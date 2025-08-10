// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock jsPDF and autoTable for testing environment
jest.mock('jspdf', () => {
  const mockPDF = {
    setFontSize: jest.fn(),
    text: jest.fn(),
    autoTable: jest.fn(),
    output: jest.fn().mockReturnValue(new ArrayBuffer(1000)),
    internal: {
      pageSize: {
        height: 297
      }
    }
  };
  
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockPDF)
  };
});

jest.mock('jspdf-autotable', () => ({}));

// Mock canvas for PDF functionality
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    resetTransform: jest.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    strokeStyle: '#000',
    fillStyle: '#000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: 'transparent',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    measureText: jest.fn(() => ({ width: 0 })),
    fillText: jest.fn(),
    strokeText: jest.fn()
  }))
});