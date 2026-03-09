import CaseInsensitiveMap, {CaseInsensitiveStringMap} from './CaseInsensitiveMap';

describe('CaseInsensitiveStringMap', () => {
  it('should set and get values case-insensitively', () => {
    const map = new CaseInsensitiveStringMap();
    map.set('Key', 'Value');
    expect(map.get('key')).toBe('Value');
    expect(map.get('KEY')).toBe('Value');
  });

  it('should delete keys case-insensitively', () => {
    const map = new CaseInsensitiveStringMap();
    map.set('Key', 'Value');
    expect(map.delete('key')).toBe(true);
    expect(map.get('Key')).toBeUndefined();
  });

  it('should iterate over entries in original case', () => {
    const map = new CaseInsensitiveStringMap([
      ['Key1', 'Value1'],
      ['Key2', 'Value2'],
    ]);
    const entries = Array.from(map.entries());
    expect(entries).toEqual([
      ['Key1', 'Value1'],
      ['Key2', 'Value2'],
    ]);
  });

  it('should return correct keys', () => {
    const map = new CaseInsensitiveStringMap([
      ['Key1', 'Value1'],
      ['Key2', 'Value2'],
    ]);
    const keys = Array.from(map.keys());
    expect(keys).toEqual(['Key1', 'Key2']);
  });

  it('should return correct values', () => {
    const map = new CaseInsensitiveStringMap([
      ['Key1', 'Value1'],
      ['Key2', 'Value2'],
    ]);
    const values = Array.from(map.values());
    expect(values).toEqual(['Value1', 'Value2']);
  });
});

describe('CaseInsensitiveMap', () => {
  const obj1 = {};
  const obj2 = {};
  it('should set and get values case-insensitively', () => {
    const map = new CaseInsensitiveMap<object>();
    map.set('Key', obj1);
    expect(map.get('key')).toBe(obj1);
    expect(map.get('KEY')).toBe(obj1);
  });

  it('should delete keys case-insensitively', () => {
    const map = new CaseInsensitiveMap<object>();
    map.set('Key', obj1);
    expect(map.delete('key')).toBe(true);
    expect(map.get('Key')).toBeUndefined();
  });

  it('should iterate over entries in original case', () => {
    const map = new CaseInsensitiveMap<object>([
      ['Key1', obj1],
      ['Key2', obj2],
    ]);
    const entries = Array.from(map.entries());
    expect(entries).toEqual([
      ['Key1', obj1],
      ['Key2', obj2],
    ]);
  });

  it('should return correct keys', () => {
    const map = new CaseInsensitiveMap<object>([
      ['Key1', obj1],
      ['Key2', obj2],
    ]);
    const keys = Array.from(map.keys());
    expect(keys).toEqual(['Key1', 'Key2']);
  });

  it('should return correct values', () => {
    const map = new CaseInsensitiveMap<any>([
      ['Key1', obj1],
      ['Key2', 'Value2'],
    ]);
    const values = Array.from(map.values());
    expect(values).toEqual([obj1, 'Value2']);
  });

  it('should implement the Map interface correctly', () => {
    const map = new CaseInsensitiveMap<any>([
      ['int', 1],
      ['string', 'value'],
    ]);
    map.delete('Int');
    expect(Array.from(map.entries())).toEqual([['string', 'value']]);
    let numItems = 0;
    map.forEach((v, k, m) => {
      numItems++;
      expect(v).toBe('value');
      expect(k).toBe('string');
      expect(m).toBe(map);
    });
    expect(numItems).toBe(1);
    map.clear();
    expect(map.size).toBe(0);
    map.set('Key', 'Value');
    expect(map.has('key')).toBe(true);
    const values = Array.from(map.values());
    expect(values).toEqual(['Value']);
    map.clear();
    const obj = {foo: 'bar'};
    expect(map.has('Key')).toBe(false);
    expect(map.get('Key')).toBeUndefined();
    expect(map.getOrInsert('Key', obj)).toBe(obj);
    expect(map.getOrInsert('Key', 'ignored')).toBe(obj);
    expect(map.get('kEY')).toBe(obj);
    expect([...map.keys()]).toEqual(['Key']);
    map.clear();
    expect(map.has('Key')).toBe(false);
    expect(map.get('Key')).toBeUndefined();
    expect(map.getOrInsertComputed('Key', () => obj)).toBe(obj);
    expect(map.getOrInsert('Key', 'ignored1')).toBe(obj);
    expect(map.getOrInsertComputed('Key', () => 'ignored2')).toBe(obj);
    expect(map.get('kEY')).toBe(obj);
    expect([...map.keys()]).toEqual(['Key']);
    map.clear();
    map.set('alpha', 1);
    map.set('beta', 2);
    const iteratorResult: [string, number][] = [];
    for (const entry of map) {
      iteratorResult.push(entry);
    }

    expect(iteratorResult).toEqual([
      ['alpha', 1],
      ['beta', 2],
    ]);
  });
});
