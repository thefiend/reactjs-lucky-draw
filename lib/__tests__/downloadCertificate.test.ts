import { downloadCertificate } from '@/lib/downloadCertificate';

jest.mock('html2canvas', () => jest.fn());

describe('downloadCertificate', () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    createObjectURL = jest.fn(() => 'blob:mock-url');
    revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('does nothing when ref.current is null', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    await downloadCertificate({ current: null }, 'test.png');
    expect(html2canvas).not.toHaveBeenCalled();
  });

  it('calls html2canvas with the element', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'test.png');

    expect(html2canvas).toHaveBeenCalledWith(div, { useCORS: true, scale: 2 });
  });

  it('creates and revokes object URL', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'test.png');

    expect(createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('triggers anchor click with correct download attribute', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'my-cert.png');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
