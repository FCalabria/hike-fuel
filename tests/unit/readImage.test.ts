import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockGenerateText, mockGoogleModel, mockCreateGoogle } = vi.hoisted(() => {
  const mockGoogleModel = vi.fn((modelId: string) => ({ id: modelId }));
  const mockGenerateText = vi.fn();
  const mockCreateGoogle = vi.fn(() => mockGoogleModel);
  return { mockGenerateText, mockGoogleModel, mockCreateGoogle };
});

vi.mock('ai', () => ({
  generateText: (opts: unknown) => mockGenerateText(opts),
  Output: {
    object: vi.fn((opts: unknown) => ({ type: 'object', ...(opts as object) })),
  },
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogle: () => mockCreateGoogle(),
  google: (modelId: string) => mockGoogleModel(modelId),
}));

import { readImage, type ReadImageData } from '~/utils/readImage';

const sampleBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const sampleNutritionalData: ReadImageData = {
  quantity: 100,
  energy: 450,
  carbs: 55,
  sugar: 20,
  fats: 15,
  protein: 12,
  salt: 0.8,
};

describe('readImage with Gemini Flash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. should return parsed nutritional data for a valid image', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    const result = await readImage(sampleBase64);

    expect(result).toEqual(sampleNutritionalData);
    expect(mockGenerateText).toHaveBeenCalledOnce();
  });

  it('2. should use Gemini Flash model', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    await readImage(sampleBase64);

    expect(mockGenerateText).toHaveBeenCalledOnce();
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.model).toBeDefined();
    expect(mockGoogleModel).toHaveBeenCalledWith(
      expect.stringMatching(/gemini.*flash/)
    );
  });

  it('3. should pass the image as a file part in the user message', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    await readImage(sampleBase64);

    const callArgs = mockGenerateText.mock.calls[0][0];
    const messageContent = callArgs.messages[0].content;

    expect(messageContent).toHaveLength(2);
    expect(messageContent[0]).toEqual(
      expect.objectContaining({ type: 'text' })
    );
    expect(messageContent[1]).toEqual({
      type: 'file',
      data: sampleBase64,
      mediaType: 'image/*',
    });
  });

  it('4. should request structured output with Output.object', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    await readImage(sampleBase64);

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.output).toBeDefined();
    expect(callArgs.output.type).toBe('object');
    expect(callArgs.output.schema).toBeDefined();
  });

  it('5. should return null when given an empty string without calling AI', async () => {
    const result = await readImage('');
    expect(result).toBeNull();
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('6. should handle null values in the AI response (unidentified fields)', async () => {
    const partialData: ReadImageData = {
      quantity: 50,
      energy: 200,
      carbs: null,
      sugar: null,
      fats: 10,
      protein: null,
      salt: null,
    };

    mockGenerateText.mockResolvedValue({
      output: partialData,
    });

    const result = await readImage(sampleBase64);
    expect(result).toEqual(partialData);
    expect(result?.carbs).toBeNull();
    expect(result?.sugar).toBeNull();
    expect(result?.protein).toBeNull();
    expect(result?.salt).toBeNull();
  });

  it('7. should return null when the AI returns null output', async () => {
    mockGenerateText.mockResolvedValue({
      output: null,
    });

    const result = await readImage(sampleBase64);
    expect(result).toBeNull();
  });

  it('8. should throw when the AI API call fails', async () => {
    mockGenerateText.mockRejectedValue(new Error('Gemini API rate limit exceeded'));

    await expect(readImage(sampleBase64)).rejects.toThrow(
      'Gemini API rate limit exceeded'
    );
  });

  it('9. should include a prompt mentioning nutritional info and multiple languages', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    await readImage(sampleBase64);

    const callArgs = mockGenerateText.mock.calls[0][0];
    const textContent = callArgs.messages[0].content[0].text as string;

    expect(textContent.toLowerCase()).toContain('nutritional');
    expect(textContent.toLowerCase()).toMatch(/spanish|english/);
  });

  it('10. should return all 7 expected nutritional fields', async () => {
    mockGenerateText.mockResolvedValue({
      output: sampleNutritionalData,
    });

    const result = await readImage(sampleBase64);

    const expectedKeys: (keyof ReadImageData)[] = [
      'quantity',
      'energy',
      'carbs',
      'sugar',
      'fats',
      'protein',
      'salt',
    ];
    expect(Object.keys(result!).sort()).toEqual(expectedKeys.sort());
  });
});
