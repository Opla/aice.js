/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// ----- Inline Syntax Adapter (Callable)
const callableRegex = new RegExp(/{{(.+?)\((.+?)\)}}|<<(.+?)\((.+?)\)>>/, 'g');
const paramsRegex = new RegExp(/ ?`(.+?)` ?,?| ?(.+?) *,| *(.+)/, 'g');
const variableRegex = new RegExp(/{\$(.+?)}| *\$(\w+) */, 'g');

const parseAdaptInlineSyntax = text => {
  const callables = [];
  let newInlineText = '';
  let indexInlineBuilder = 0;
  let matchCallable = callableRegex.exec(text);
  while (matchCallable) {
    const [, gService, gCallableParams, sService, sCallableParams] = matchCallable;
    const callable = {
      service: gService || sService,
      parameters: [],
    };
    const callableParams = gCallableParams || sCallableParams;
    const callableIsOutput = !!gCallableParams;
    let matchParam = paramsRegex.exec(callableParams);

    while (matchParam) {
      matchParam.shift();
      const params = matchParam.find(m => m);
      let parameters = '';
      let matchVariable = variableRegex.exec(params);

      let index = 0;
      while (matchVariable) {
        parameters += params.slice(index, matchVariable.index);

        matchVariable.shift();
        const variable = matchVariable.find(mp => mp);
        parameters += `{{${variable}}}`;

        index = variableRegex.lastIndex;
        matchVariable = variableRegex.exec(params);
      }

      parameters += params.slice(index, params.length);

      callable.parameters.push(parameters);
      matchParam = paramsRegex.exec(callableParams);
    }

    // Rebuild InlineText - Text & WS variable
    newInlineText += text.slice(indexInlineBuilder, matchCallable.index);
    if (callableIsOutput) {
      newInlineText += `{{${callable.service}}}`;
    }
    indexInlineBuilder = matchCallable.index + matchCallable[0].length;

    callables.push(callable);
    matchCallable = callableRegex.exec(text);
  }
  // Rebuild InlineText - End of the text
  newInlineText += text.slice(indexInlineBuilder, text.length);

  return { callables, newInlineText };
};

const parseValue = match => {
  const isText = match.includes("'") || match.includes('"');
  const value = match.trim();

  return isText ? value.slice(1, -1) : { type: 'VARIABLE', value };
};

// ----- Outputs Adapter
const parseAdaptOutputsSyntax = oldOutputs => {
  const outputs = [];
  oldOutputs.forEach(oldOutput => {
    if (typeof oldOutput === 'string') {
      // Without Condition
      const output = { conditions: [], callables: [] };

      const parsed = parseAdaptInlineSyntax(oldOutput);
      output.outputMessage = parsed.newInlineText;
      output.callables = parsed.callables;

      outputs.push(output);
    } else {
      // Conditions
      oldOutput.children.forEach(conditionOutput => {
        const output = { conditions: [], callables: [] };
        const condition = {
          type: 'LeftRightExpression',
          operator: 'eq',
          leftOperand: parseValue(conditionOutput.name),
          rightOperand: conditionOutput.value,
        };

        const parsed = parseAdaptInlineSyntax(conditionOutput.text);
        output.outputMessage = parsed.newInlineText;
        output.callables = parsed.callables;
        output.conditions.push(condition);

        outputs.push(output);
      });
    }
  });
  return outputs;
};

// ----- Inputs Adapter
const parseAdaptInputsSyntax = oldInputs => {
  const inputs = [];
  oldInputs.forEach(oldInput => {
    // TODO transformer * -> {{*}} || ^ -> {{^}} || @entity -> {{@entity}}
    const input = { inputMessage: oldInput };

    inputs.push(input);
  });
  return inputs;
};

// ----- Intent Adapter
const parseAdaptIntentSyntax = oldIntents => {
  const intents = [];
  oldIntents.forEach(oldIntent => {
    const { id, name, topic = '*', previous = [], input, output } = oldIntent;

    const intent = { id, name, topic, previous, outputType: 'multiple' };
    intent.inputs = parseAdaptInputsSyntax(input);
    intent.outputs = parseAdaptOutputsSyntax(output);

    intents.push(intent);
  });
  return intents;
};

// ----- Document OpenNLXSyntax Adapter
const parseAdaptOpenNLXSyntax = oldBotDocument => {
  const { name } = oldBotDocument;
  const { botId } = oldBotDocument.intents[0] || {};
  const intents = parseAdaptIntentSyntax(oldBotDocument.intents);

  const document = { name, botId, timestamp: new Date(), intents };

  return document;
};

const parseAdaptOpenNLXSyntaxV3 = oldBotDocument => {
  const { name } = oldBotDocument;
  const intents = parseAdaptIntentSyntax(oldBotDocument.intents);
  const { entities, variables } = oldBotDocument; // Might need transformation ? See later

  const document = { name, timestamp: new Date(), intents, entities, variables };

  return document;
};

class OpenNLXSyntaxAdapter {}
OpenNLXSyntaxAdapter.parseAdaptOpenNLXSyntax = parseAdaptOpenNLXSyntax;
OpenNLXSyntaxAdapter.parseAdaptOpenNLXSyntaxV3 = parseAdaptOpenNLXSyntaxV3;

export default OpenNLXSyntaxAdapter;

export { parseAdaptOpenNLXSyntax, parseAdaptOpenNLXSyntaxV3 };
