import {
  BEAD_COLORS,
  BEAD_COLOR_NAMES,
  BEAD_COLOR_EMOJIS,
  BEAD_COLOR_CODES,
  CODE_TO_BEAD_COLOR,
  BeadColor
} from './index';

describe('Types and Constants', () => {
  describe('BEAD_COLORS', () => {
    it('contains all 10 expected colors with correct hex values', () => {
      expect(BEAD_COLORS.red).toBe('#FF0000');
      expect(BEAD_COLORS.orange).toBe('#FFA500');
      expect(BEAD_COLORS.yellow).toBe('#FFFF00');
      expect(BEAD_COLORS.green).toBe('#008000');
      expect(BEAD_COLORS.blue).toBe('#0000FF');
      expect(BEAD_COLORS.purple).toBe('#800080');
      expect(BEAD_COLORS.black).toBe('#000000');
      expect(BEAD_COLORS.white).toBe('#FFFFFF');
      expect(BEAD_COLORS.pink).toBe('#FFC0CB');
      expect(BEAD_COLORS.brown).toBe('#A52A2A');
    });

    it('has exactly 10 colors', () => {
      expect(Object.keys(BEAD_COLORS)).toHaveLength(10);
    });
  });

  describe('BEAD_COLOR_NAMES', () => {
    it('contains correct Japanese names for all colors', () => {
      expect(BEAD_COLOR_NAMES.red).toBe('赤');
      expect(BEAD_COLOR_NAMES.orange).toBe('オレンジ');
      expect(BEAD_COLOR_NAMES.yellow).toBe('黄');
      expect(BEAD_COLOR_NAMES.green).toBe('緑');
      expect(BEAD_COLOR_NAMES.blue).toBe('青');
      expect(BEAD_COLOR_NAMES.purple).toBe('紫');
      expect(BEAD_COLOR_NAMES.black).toBe('黒');
      expect(BEAD_COLOR_NAMES.white).toBe('白');
      expect(BEAD_COLOR_NAMES.pink).toBe('ピンク');
      expect(BEAD_COLOR_NAMES.brown).toBe('茶');
    });

    it('has names for all bead colors', () => {
      const colorKeys = Object.keys(BEAD_COLORS) as BeadColor[];
      colorKeys.forEach(color => {
        expect(BEAD_COLOR_NAMES[color]).toBeDefined();
        expect(typeof BEAD_COLOR_NAMES[color]).toBe('string');
      });
    });
  });

  describe('BEAD_COLOR_EMOJIS', () => {
    it('contains correct emojis for all colors', () => {
      expect(BEAD_COLOR_EMOJIS.red).toBe('🔴');
      expect(BEAD_COLOR_EMOJIS.orange).toBe('🟠');
      expect(BEAD_COLOR_EMOJIS.yellow).toBe('🟡');
      expect(BEAD_COLOR_EMOJIS.green).toBe('🟢');
      expect(BEAD_COLOR_EMOJIS.blue).toBe('🔵');
      expect(BEAD_COLOR_EMOJIS.purple).toBe('🟣');
      expect(BEAD_COLOR_EMOJIS.black).toBe('⚫');
      expect(BEAD_COLOR_EMOJIS.white).toBe('⚪');
      expect(BEAD_COLOR_EMOJIS.pink).toBe('🩷');
      expect(BEAD_COLOR_EMOJIS.brown).toBe('🤎');
    });

    it('has emojis for all bead colors', () => {
      const colorKeys = Object.keys(BEAD_COLORS) as BeadColor[];
      colorKeys.forEach(color => {
        expect(BEAD_COLOR_EMOJIS[color]).toBeDefined();
        expect(typeof BEAD_COLOR_EMOJIS[color]).toBe('string');
      });
    });
  });

  describe('BEAD_COLOR_CODES', () => {
    it('contains correct single character codes', () => {
      expect(BEAD_COLOR_CODES.white).toBe('w');
      expect(BEAD_COLOR_CODES.black).toBe('d');
      expect(BEAD_COLOR_CODES.pink).toBe('p');
      expect(BEAD_COLOR_CODES.red).toBe('r');
      expect(BEAD_COLOR_CODES.orange).toBe('o');
      expect(BEAD_COLOR_CODES.yellow).toBe('y');
      expect(BEAD_COLOR_CODES.green).toBe('g');
      expect(BEAD_COLOR_CODES.blue).toBe('b');
      expect(BEAD_COLOR_CODES.purple).toBe('v');
      expect(BEAD_COLOR_CODES.brown).toBe('m');
    });

    it('has unique codes for each color', () => {
      const codes = Object.values(BEAD_COLOR_CODES);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('all codes are single characters', () => {
      Object.values(BEAD_COLOR_CODES).forEach(code => {
        expect(code.length).toBe(1);
      });
    });
  });

  describe('CODE_TO_BEAD_COLOR', () => {
    it('correctly maps codes back to colors', () => {
      expect(CODE_TO_BEAD_COLOR.w).toBe('white');
      expect(CODE_TO_BEAD_COLOR.d).toBe('black');
      expect(CODE_TO_BEAD_COLOR.p).toBe('pink');
      expect(CODE_TO_BEAD_COLOR.r).toBe('red');
      expect(CODE_TO_BEAD_COLOR.o).toBe('orange');
      expect(CODE_TO_BEAD_COLOR.y).toBe('yellow');
      expect(CODE_TO_BEAD_COLOR.g).toBe('green');
      expect(CODE_TO_BEAD_COLOR.b).toBe('blue');
      expect(CODE_TO_BEAD_COLOR.v).toBe('purple');
      expect(CODE_TO_BEAD_COLOR.m).toBe('brown');
    });

    it('maps null code to white', () => {
      expect(CODE_TO_BEAD_COLOR.n).toBe('white');
    });

    it('creates bidirectional mapping with BEAD_COLOR_CODES', () => {
      const colorKeys = Object.keys(BEAD_COLOR_CODES) as BeadColor[];
      colorKeys.forEach(color => {
        const code = BEAD_COLOR_CODES[color];
        expect(CODE_TO_BEAD_COLOR[code]).toBe(color);
      });
    });
  });

  describe('Type consistency', () => {
    it('all constants have consistent keys', () => {
      const colorKeys = Object.keys(BEAD_COLORS) as BeadColor[];
      
      colorKeys.forEach(color => {
        expect(BEAD_COLOR_NAMES).toHaveProperty(color);
        expect(BEAD_COLOR_EMOJIS).toHaveProperty(color);
        expect(BEAD_COLOR_CODES).toHaveProperty(color);
      });
    });

    it('has exactly 10 entries in each constant', () => {
      expect(Object.keys(BEAD_COLORS)).toHaveLength(10);
      expect(Object.keys(BEAD_COLOR_NAMES)).toHaveLength(10);
      expect(Object.keys(BEAD_COLOR_EMOJIS)).toHaveLength(10);
      expect(Object.keys(BEAD_COLOR_CODES)).toHaveLength(10);
    });
  });
});
