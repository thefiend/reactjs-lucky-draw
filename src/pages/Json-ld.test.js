import {
  FAQ,
  SOFTWARE_APPLICATION,
  ORGANIZATION,
  BREADCRUMB_HOME,
  HOW_TO,
  WEBSITE,
} from './Json-ld';

describe('Json-ld schemas', () => {
  describe('FAQ', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(FAQ); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type FAQPage', () => { expect(schema['@type']).toBe('FAQPage'); });
    it('has 15 questions', () => { expect(schema.mainEntity).toHaveLength(15); });
    it('contains no HTML tags in answer text', () => {
      schema.mainEntity.forEach(q => {
        expect(q.acceptedAnswer.text).not.toMatch(/<[^>]+>/);
      });
    });
    it('first question targets lucky draw online generator keyword', () => {
      expect(schema.mainEntity[0].name).toMatch(/lucky draw online generator/i);
    });
  });

  describe('SOFTWARE_APPLICATION', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(SOFTWARE_APPLICATION); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type SoftwareApplication', () => { expect(schema['@type']).toBe('SoftwareApplication'); });
    it('name is Lucky Draw Online Generator', () => {
      expect(schema.name).toBe('Lucky Draw Online Generator');
    });
    it('has dateModified 2026-05-30', () => { expect(schema.dateModified).toBe('2026-05-30'); });
    it('has no reviewCount field (avoid duplication)', () => {
      expect(schema.aggregateRating.reviewCount).toBeUndefined();
    });
    it('featureList contains generator keyword', () => {
      expect(schema.featureList).toMatch(/lucky draw online generator/i);
    });
  });

  describe('ORGANIZATION', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(ORGANIZATION); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type Organization', () => { expect(schema['@type']).toBe('Organization'); });
    it('has url', () => { expect(schema.url).toBe('https://luckydraw.me'); });
  });

  describe('BREADCRUMB_HOME', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(BREADCRUMB_HOME); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type BreadcrumbList', () => { expect(schema['@type']).toBe('BreadcrumbList'); });
    it('has one item', () => { expect(schema.itemListElement).toHaveLength(1); });
  });

  describe('HOW_TO', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(HOW_TO); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type HowTo', () => { expect(schema['@type']).toBe('HowTo'); });
    it('has 4 steps', () => { expect(schema.step).toHaveLength(4); });
    it('steps have sequential positions', () => {
      schema.step.forEach((s, i) => { expect(s.position).toBe(i + 1); });
    });
    it('name contains lucky draw online generator', () => {
      expect(schema.name).toMatch(/lucky draw online generator/i);
    });
  });

  describe('WEBSITE', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(WEBSITE); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type WebSite', () => { expect(schema['@type']).toBe('WebSite'); });
    it('url is luckydraw.me', () => { expect(schema.url).toBe('https://luckydraw.me'); });
  });
});
