import * as React from 'react'; // tslint:disable-line no-unused-variable

import './index.sass';

import { hideBorderAndModify, RegexTokenizerModifier } from '../../assets/ts/utils/token_unfolder';
import { registerPlugin } from '../../assets/ts/plugins';
import { matchWordRegex } from '../../assets/ts/utils/text';

const boldClass = 'bold';
const italicsClass = 'italic';
const underlineClass = 'underline';

registerPlugin(
  {
    name: 'Text Formatting',
    author: 'Jeff Wu',
    description: (
      <div>
      Lets you:
      <ul>
        <li> <span className='italic'>italicize</span> text by surrounding with *asterisks* </li>
        <li> <span className='bold'>bold</span> text by surrounding with **double asterisks** </li>
        <li> <span className='underline'>underline</span> text by surrounding with _underscores_ </li>
      </ul>
      </div>
    ),
  },
  function(api) {
    api.registerHook('session', 'renderLineTokenHook', (tokenizer, hooksInfo) => {
      if (hooksInfo.has_cursor) {
        return tokenizer;
      }
      if (hooksInfo.has_highlight) {
        return tokenizer;
      }
      return tokenizer.then(RegexTokenizerModifier(
        // triple asterisk means both bold and italic
        matchWordRegex('\\*\\*\\*(\\n|.)+?\\*\\*\\*'),
        hideBorderAndModify(3, 3, (char_info) => {
          char_info.renderOptions.classes[italicsClass] = true;
          char_info.renderOptions.classes[boldClass] = true;
        })
      )).then(RegexTokenizerModifier(
        matchWordRegex('(?:(\\*\\*_)|(_\\*\\*))(\\n|.)+?(?:(\\*\\*_)|(_\\*\\*))'),
        hideBorderAndModify(3, 3, (char_info) => {
          char_info.renderOptions.classes[boldClass] = true;
          char_info.renderOptions.classes[underlineClass] = true;
        })
      )).then(RegexTokenizerModifier(
        matchWordRegex('(?:(\\*_)|(_\\*))(\\n|.)+?(?:(\\*_)|(_\\*))'),
        hideBorderAndModify(2, 2, (char_info) => {
          char_info.renderOptions.classes[italicsClass] = true;
          char_info.renderOptions.classes[underlineClass] = true;
        })
      )).then(RegexTokenizerModifier(
        // middle is either a single character, or both sides have a non-* character
        matchWordRegex('\\*((\\n|[^\\*])|[^\\*](\\n|.)+?[^\\*])?\\*'),
        hideBorderAndModify(1, 1, (char_info) => {
          char_info.renderOptions.classes[italicsClass] = true;
        })
      )).then(RegexTokenizerModifier(
        matchWordRegex('\\*\\*(\\n|.)+?\\*\\*'),
        hideBorderAndModify(2, 2, (char_info) => {
          char_info.renderOptions.classes[boldClass] = true;
        })
      )).then(RegexTokenizerModifier(
        matchWordRegex('(?:[\\*]*)_(\\n|.)+?_(?:[\\*]*)'),
        hideBorderAndModify(1, 1, (char_info) => {
          char_info.renderOptions.classes[underlineClass] = true;
        })
      ));
    });
  },
  (api => api.deregisterAll()),
);
