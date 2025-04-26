export interface DictionaryMock {
  words: Set<string>;
  language: string;
  affix?: string;
  compound?: string;
}