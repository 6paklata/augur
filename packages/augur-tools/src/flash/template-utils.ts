import { TEMPLATES, CategoryTemplate, isTemplateMarket, ExtraInfoTemplate, Template } from '@augurproject/artifacts';
import { stringTo32ByteHex } from '@augurproject/sdk';
import { BigNumber } from 'ethers/utils';

export const showTemplateByHash = (hash: string): Template => {
  console.log('show template by hash');
  const templates = Object.keys(TEMPLATES).map(c =>
    findTemplate(TEMPLATES[c], hash)
  );
  return templates.length > 0 ? templates[0] : undefined;
};

const findTemplate = (category: CategoryTemplate, hash: string): Template => {
  if (category.children) {
    const templates = Object.keys(category.children)
      .map(c => findTemplate(category.children[c], hash))
      .filter(t => t);
    return templates.length > 0 ? templates[0] : undefined;
  }
  return category.templates.find(t => t.hash === hash);
};

export const validateMarketTemplate = (
  title: string,
  templateInfo: string,
  outcomesString: string,
  longDescription: string,
  endTime: number
): string => {
  try {
    const extraInfoTemplate = JSON.parse(templateInfo) as ExtraInfoTemplate;
    let outcomes = [];
    if (outcomesString) {
      outcomes = outcomesString.split(',').map(stringTo32ByteHex);
    }
    let details = longDescription;
    if (longDescription) {
      const splits = longDescription.split('\\n');
      details = splits.join('\n');
    }
    const endTimeHex = new BigNumber(endTime).toHexString();
    const errors = [];
    const result = isTemplateMarket(
      title,
      extraInfoTemplate,
      outcomes,
      details,
      endTimeHex,
      errors
    );

    if (result) return 'success';
    const error = errors[0];
    return `error: ${error}`;
  } catch (e) {
    return `error: unknown, ${e}`;
  }
};

